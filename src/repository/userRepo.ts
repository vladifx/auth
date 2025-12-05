import { FastifyInstance } from "fastify";
import { User } from "@prisma/client";
import { USER_SELECT } from "../schemas/user";
import { RedisClient } from "../clients/redisClient";

export class UserRepo {
    private redisClient;
    private prisma;

    constructor(app: FastifyInstance) {
        this.redisClient = new RedisClient(app);
        this.prisma = app.prisma;
    }

    private CACHE_TTL = 60 * 5   // 5 minutes

    private getCacheKey(id: string) {
        return `user_profile:${id}`;
    }

    async findByIdAndCache(id: string) {
        const key = this.getCacheKey(id);

        const cache = await this.redisClient.getData<User>(key);
        if (cache) return cache;

        const user = await this.prisma.user.findUnique({
            where: { id: id },
            select: USER_SELECT
        });
        if (!user) return null;

        await this.redisClient.saveData(key, user, this.CACHE_TTL);

        return { ...user, createdAt: user.createdAt.toISOString() };
    }

    async findByIdWithPassword(id: string) {
        return this.prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                password: true,
                isEmailVerified: true,
            }
        });
    }

    async updatePassword(userId: string, newPassword: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                password: newPassword,
            }
        })
    }
}