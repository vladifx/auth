import "fastify";
import { RedisClient } from "../database/redis/redis";
import { PrismaClient } from "@prisma/client";
import { TokenManager } from "../managers/tokens/tokenManager";
import { TokenPayload } from "../managers/tokens/interfaces"
import { AuthService } from "../services/authService";
import { UserService } from "../services/userService";
import { SessionManager } from "../managers/session/sessionManager";
import { MailClient } from "../clients/mailClient";

declare module "fastify" {
    interface FastifyInstance {
        redis: RedisClient;
        prisma: PrismaClient;
        tokenManager: TokenManager;
        sessionManager: SessionManager;
        authService: AuthService;
        userService: UserService;
        authMiddleware: typeof authMiddleware;
        mailClient: MailClient;
    }

    interface FastifyRequest {
        user: TokenPayload;
    }
}

