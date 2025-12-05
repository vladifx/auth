import bcrypt from "bcryptjs";
import Config from "../config/env";
import ApiError from "../exceptions/apiError"
import { TokenManager } from "../managers/tokens/tokenManager";
import { FastifyInstance } from "fastify";
import { AuthRepo } from "../repository/authRepo";
import { SessionManager } from "../managers/session/sessionManager";
import { RedisClient } from "../clients/redisClient";
import { MailClient } from "../clients/mailClient";

export class AuthService {
    private authRepo: AuthRepo;
    private tokenManager: TokenManager;
    private sessionManager: SessionManager;
    private mailClient: MailClient;
    private redisClient: RedisClient;

    constructor(app: FastifyInstance) {
        this.tokenManager = app.tokenManager;
        this.sessionManager = new SessionManager(app);
        this.mailClient = new MailClient(app);
        this.authRepo = new AuthRepo(app);
        this.redisClient = new RedisClient(app);
    }

    private VERIFY_TTL = 24 * 60 * 60;   // 24 hours
    private RESET_TTL  = 15 * 60;        // 15 minutes

    private verifyKey(token: string) {
        return `verify:${token}`;
    }
    private resetKey(token: string) {
        return `reset:${token}`;
    }

    async registration(username: string, email: string, password: string) {
        const candidate = await this.authRepo.findByEmail(email);
        if (candidate) {
            throw ApiError.BadRequest(`Username "${username}" already exists`);
        }
        const hashedPassword = await bcrypt.hash(password, 5);

        const user = await this.authRepo.createUser(
            email,
            hashedPassword,
            username
        );

        const tokenEmail = crypto.randomUUID();
        await this.redisClient.saveData(this.verifyKey(tokenEmail), user.id, this.VERIFY_TTL);

        const varificationLink = `${Config.String("APP_URL")}/auth/activate/${tokenEmail}`;
        await this.mailClient.sendActivationLink(user.email, varificationLink);
    }

    async login(email: string, password: string) {
        const user = await this.authRepo.findByEmail(email);
        if (!user) throw ApiError.BadRequest("User not found");

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw ApiError.BadRequest(`Invalid password`);

        const sessionId = crypto.randomUUID();
        await this.sessionManager.createSession(sessionId, {
            userId: user.id,
            createdAt: new Date().toISOString()
        })

        const tokens = this.tokenManager.generateToken({
            userId: user.id,
            sessionId: sessionId,
        });

        await this.tokenManager.saveTokens({
            userId: user.id,
            sessionId: sessionId,
        }, tokens);

        return { user, ...tokens, sessionId };
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const payload = await this.tokenManager.validateRefreshToken(refreshToken);
        if (!payload) throw ApiError.UnauthorizedError();

        await this.tokenManager.removeSessionToken(payload.userId, payload.sessionId);

        const tokens = this.tokenManager.generateToken({
            userId: payload.userId,
            sessionId: payload.sessionId
        });
        await this.tokenManager.saveTokens(payload, tokens);

        return { ...tokens, sessionId: payload.sessionId };
    }

    async logout(refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const payload = await this.tokenManager.validateRefreshToken(refreshToken);
        if (!payload) throw ApiError.BadRequest(`Invalid refresh token`);

        await this.tokenManager.removeSessionToken(payload.userId, payload.sessionId);

        await this.sessionManager.deleteSession(payload.sessionId);
    }

    async logoutFromAllDevice(refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const payload = await this.tokenManager.validateRefreshToken(refreshToken);
        if (!payload) throw ApiError.BadRequest(`Invalid refresh token`);

        await this.tokenManager.removeAllUserTokens(payload.userId);

        await this.sessionManager.deleteAllUserSessions(payload.userId);
    }

    async activateEmail(token: string) {
        const userId = await this.redisClient.getData<string>(this.verifyKey(token));
        if (!userId) throw ApiError.BadRequest("Activation link invalid or expired");


        await this.authRepo.updateUserData(userId, { isEmailVerified: true } );
        await this.redisClient.deleteData(this.verifyKey(token));
    }

    async resendActivationLink(email: string) {
        const user = await this.authRepo.findByEmail(email);
        if (!user) throw ApiError.BadRequest("User not found");
        if (user.isEmailVerified) throw ApiError.BadRequest("Email already activated");

        const tokenEmail = crypto.randomUUID();
        await this.redisClient.saveData(this.verifyKey(tokenEmail), user.id, this.VERIFY_TTL);

        const varificationLink = `${Config.String("APP_URL")}/auth/activate/${tokenEmail}`;
        await this.mailClient.sendActivationLink(user.email, varificationLink);
    }

    async forgotPassword(email: string) {
        const user = await this.authRepo.findByEmail(email);
        if (!user) throw ApiError.BadRequest("User not found");
        if (!user.isEmailVerified) {
            throw ApiError.Forbidden("Email not verified");
        }

        const token = crypto.randomUUID();
        await this.redisClient.saveData(this.resetKey(token), user.id, this.RESET_TTL);

        const resetLink = `${Config.String("APP_URL")}/auth/reset-password/${token}`;
        await this.mailClient.sendPasswordResetLink(user.email, resetLink);
    }

    async resetPassword(token: string, newPassword: string) {
        const userId = await this.redisClient.getData<string>(this.resetKey(token));
        if (!userId) {
            throw ApiError.BadRequest("Invalid or expired token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 5);
        await this.authRepo.updateUserData(userId, { password: hashedPassword });

        await this.redisClient.deleteData(this.resetKey(token));
    }
}