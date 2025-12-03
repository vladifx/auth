import { FastifyInstance } from "fastify";

export class MailRepo {
    private redis;
    private TTL = 24 * 60 * 60;

    constructor(app: FastifyInstance) {
        this.redis = app.redis;
    }

    private key(token: string) {
        return `verify:${token}`;
    }

    async save(token: string, userId: string) {
        await this.redis.set(
            this.key(token),
            userId,
            "EX", this.TTL);
    }

    async find(token: string) {
        return await this.redis.get(this.key(token));
    }

    async delete(token: string) {
        await this.redis.del(this.key(token));
    }
}