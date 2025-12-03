import "fastify";
import { RedisClient } from "../database/redis/redis";
import { PrismaClient } from "@prisma/client";
import { TokenPayload, TokenService } from "../services/tokenService";
import { AuthService } from "../services/authService";
import { UserService } from "../services/userService";
import { SessionRepo } from "../repository/sessionRepo";
import { MailService } from "../services/mailService";

declare module "fastify" {
    interface FastifyInstance {
        redis: RedisClient;
        prisma: PrismaClient;
        tokenService: TokenService;
        authService: AuthService;
        userService: UserService;
        authenticate: typeof authMiddleware;
        session: SessionRepo;
        mailService: MailService;
    }

    interface FastifyRequest {
        user: TokenPayload;
    }
}

