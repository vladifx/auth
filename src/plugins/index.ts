import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

import { prisma } from "../database/prisma/prisma"
import { redis, RedisClient } from "../database/redis/redis"
import { TokenManager } from "../managers/tokens/tokenManager"
import { MailClient } from "../clients/mailClient";
import { AuthService } from "../services/authService.js";
import { SessionManager } from "../managers/session/sessionManager";
import { authMiddleware } from "../middlewares/authMiddleware";
import { UserService } from "../services/userService.js";
import rateLimit from "@fastify/rate-limit";


export default fp(async (app: FastifyInstance) => {
// Prisma
    app.decorate("prisma", prisma);
    app.addHook("onClose", async () => {
        await prisma.$disconnect();
    });

// Redis
    app.decorate("redis", redis as RedisClient);
    app.addHook("onClose", async () => {
        await redis.quit();
    });

// TokenManager
    const tokenManager = new TokenManager(app);
    app.decorate("tokenManager", tokenManager);

// MailClient
    const mailClient = new MailClient(app);
    app.decorate("mailClient", mailClient);

// AuthService
    const authService = new AuthService(app);
    app.decorate("authService", authService);

// SessionManager
    const sessionManager = new SessionManager(app);
    app.decorate("sessionManager", sessionManager);

// AuthMiddleware
    app.decorate("authMiddleware", authMiddleware);

// UserService
    const userService = new UserService(app);
    app.decorate("userService", userService);

// RateLimit
    app.register(rateLimit, {
        global: false,
        redis: app.redis,
        max: 100,
        timeWindow: "1 minute",
        ban: 0,
        keyGenerator: (req) => {
            return req.headers["x-real-ip"] as string
                || req.ip
                || "unknown";
        }
    });
})