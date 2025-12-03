import { FastifyInstance } from "fastify";

export class PasswordResetRepo {
    private redis;
    private TTL = 15 * 60; // 15 minutes

    constructor(app: FastifyInstance) {
        this.redis = app.redis;
    }

    private key(token: string) {
        return `reset:${token}`;
    }

    async saveToken(token: string, userId: string) {
        await this.redis.set(
            this.key(token),
            userId,
        "EX", this.TTL
        );
    }

    async findUserId(token: string) {
        return await this.redis.get(this.key(token));
    }

    async deleteToken(token: string) {
        await this.redis.del(this.key(token));
    }
}