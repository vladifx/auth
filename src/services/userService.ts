import { UserRepo } from "../repository/userRepo";
import { FastifyInstance } from "fastify";
import ApiError from "../exceptions/apiError";
import bcrypt from "bcryptjs";
import { SessionRepo } from "../repository/sessionRepo";

export class UserService {
    private users: UserRepo;
    private session: SessionRepo;
    private tokenService;

    constructor(app: FastifyInstance) {
        this.users = new UserRepo(app);
        this.session = new SessionRepo(app);
        this.tokenService = app.tokenService;
    }

    async getUserProfile(id: string) {
        const user = await this.users.findByIdAndCache(id);
        if (!user) {
            throw ApiError.NotFound("User not found");
        }

        return user;
    };

    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await this.users.findByIdWithPassword(userId);
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
        await this.users.updatePassword(userId, hashedPassword);

        await this.tokenService.removeAllUserTokens(userId);
        await this.session.deleteAllUserSessions(userId);

        return { success: true };
    }
}