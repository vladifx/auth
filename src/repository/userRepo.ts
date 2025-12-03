import { FastifyInstance } from "fastify";
import { User } from "@prisma/client";
import { USER_SELECT } from "../schemas/user";

export class UserRepo {
    private redis;
    private prisma;

    constructor(app: FastifyInstance) {
        this.redis = app.redis;
        this.prisma = app.prisma;
    }

    private getCacheKey(id: string) {
        return `user_profile:${id}`;
    }

    async findByIdAndCache(id: string) {
        const key = this.getCacheKey(id);

        const cached = await this.redis.get(key);
        if (cached) {
            try {
                return JSON.parse(cached) as User;
            } catch {
                await this.redis.del(key);
            }
        }

        const user = await this.prisma.user.findUnique({
            where: { id: id },
            select: USER_SELECT
        });
        if (!user) return null;

        await this.redis.set(key, JSON.stringify(user), "EX", 300);

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