import { UserRepo } from "../repository/userRepo";
import { FastifyInstance } from "fastify";
import ApiError from "../exceptions/apiError";
import bcrypt from "bcryptjs";
import { SessionManager } from "../managers/session/sessionManager";
import { TokenManager } from "../managers/tokens/tokenManager";

export class UserService {
    private userRepo: UserRepo;
    private sessionManager: SessionManager;
    private tokenManager: TokenManager;

    constructor(app: FastifyInstance) {
        this.userRepo = new UserRepo(app);
        this.sessionManager = app.sessionManager;
        this.tokenManager = app.tokenManager;
    }

    async getUserProfile(id: string) {
        const user = await this.userRepo.findByIdAndCache(id);
        if (!user) {
            throw ApiError.NotFound("User not found");
        }

        return user;
    };

    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await this.userRepo.findByIdWithPassword(userId);
        if (!user) {
            throw ApiError.NotFound("User not found");
        }

        if (!user.isEmailVerified) {
            throw ApiError.Forbidden(
                "You must activate your email before changing password"
            );
        }

        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            throw ApiError.BadRequest("Old password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 5);
        await this.userRepo.updateUserData(userId, { password: hashedPassword });

        await this.tokenManager.removeAllUserTokens(userId);
        await this.sessionManager.deleteAllUserSessions(userId);

        return { success: true };
    }
}