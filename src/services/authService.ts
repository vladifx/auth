import bcrypt from "bcryptjs";
import Config from "../config/env";
import { v4 as uuid } from "uuid";
import ApiError from "../exceptions/apiError.js"
import { TokenService } from "./tokenService.js";
import { FastifyInstance } from "fastify";
import { AuthRepo } from "../repository/authRepo";
import { SessionRepo } from "../repository/sessionRepo";
import { MailRepo } from "../repository/mailRepo";
import { PasswordResetRepo } from "../repository/passwordResetRepo";

export class AuthService {
    private users: AuthRepo;
    private tokenService: TokenService;
    private session: SessionRepo;
    private email;
    private mailService;
    private resetPass;

    constructor(app: FastifyInstance) {
        this.tokenService = app.tokenService;
        this.mailService = app.mailService;
        this.users = new AuthRepo(app);
        this.session = new SessionRepo(app);
        this.email = new MailRepo(app);
        this.resetPass = new PasswordResetRepo(app)
    }

    async registration(username: string, email: string, password: string) {
        const candidate = await this.users.findByEmail(email);
        if (candidate) {
            throw ApiError.BadRequest(`Username "${username}" already exists`);
        }
        const hashedPassword = await bcrypt.hash(password, 5);

        const user = await this.users.createUser(
            email,
            hashedPassword,
            username
        );

        const tokenEmail = uuid();
        await this.email.save(tokenEmail, user.id);

        const varificationLink = `${Config.String("APP_URL")}/auth/activate/${tokenEmail}`;
        await this.mailService.sendActivationLink(user.email, varificationLink);
    }

    async login(email: string, password: string) {
        const user = await this.users.findByEmail(email);
        if (!user) throw ApiError.BadRequest("User not found");

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw ApiError.BadRequest(`Invalid password`);

        const sessionId = uuid();
        await this.session.createSession(sessionId, {
            userId: user.id,
            createdAt: new Date().toISOString()
        })

        const tokens = this.tokenService.generateToken({
            userId: user.id,
            sessionId: sessionId,
        });

        await this.tokenService.saveTokens({
            userId: user.id,
            sessionId: sessionId,
        }, tokens);

        return { user, ...tokens, sessionId };
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const payload = await this.tokenService.validateRefreshToken(refreshToken);
        if (!payload) throw ApiError.UnauthorizedError();

        await this.tokenService.removeSessionToken(payload);

        const tokens = this.tokenService.generateToken({
            userId: payload.userId,
            sessionId: payload.sessionId
        });
        await this.tokenService.saveTokens(payload, tokens);

        return { ...tokens, sessionId: payload.sessionId };
    }

    async logout(refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const payload = await this.tokenService.validateRefreshToken(refreshToken);
        if (!payload) throw ApiError.BadRequest(`Invalid refresh token`);

        await this.tokenService.removeSessionToken(payload);

        await this.session.deleteSession(payload.sessionId);
    }

    async logoutFromAllDevice(refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const payload = await this.tokenService.validateRefreshToken(refreshToken);
        if (!payload) throw ApiError.BadRequest(`Invalid refresh token`);

        await this.tokenService.removeAllUserTokens(payload.userId);

        await this.session.deleteAllUserSessions(payload.userId);
    }

    async activateEmail(token: string) {
        const userId = await this.email.find(token);
        if (!userId) throw ApiError.BadRequest("Activation link invalid or expired");

        await this.users.verifyEmail(userId);
        await this.email.delete(token);
    }

    async resendActivationLink(email: string) {
        const user = await this.users.findByEmail(email);
        if (!user) throw ApiError.BadRequest("User not found");
        if (user.isEmailVerified) throw ApiError.BadRequest("Email already activated");

        const tokenEmail = uuid();
        await this.email.save(tokenEmail, user.id);

        const varificationLink = `${Config.String("APP_URL")}/auth/activate/${tokenEmail}`;
        await this.mailService.sendActivationLink(user.email, varificationLink);
    }

    async forgotPassword(email: string) {
        const user = await this.users.findByEmail(email);
        if (!user) throw ApiError.BadRequest("User not found");
        if (!user.isEmailVerified) {
            throw ApiError.Forbidden("Email not verified");
        }

        const token = uuid();
        await this.resetPass.saveToken(token, user.id);

        const resetLink = `${Config.String("APP_URL")}/auth/reset-password/${token}`;
        await this.mailService.sendPasswordResetLink(user.email, resetLink);
    }

    async resetPassword(token: string, newPassword: string) {
        const userId = await this.resetPass.findUserId(token);
        if (!userId) {
            throw ApiError.BadRequest("Invalid or expired token");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 5);
        await this.users.updatePassword(userId, hashedPassword);

        await this.resetPass.deleteToken(token);
    }
}

