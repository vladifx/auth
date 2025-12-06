import { FastifyInstance } from "fastify";

type RedisValue = string | number | boolean | object | unknown[];

export class RedisClient {
    private redis;

    constructor(app: FastifyInstance) {
        this.redis = app.redis;
    }

    async saveData(key: string, value: RedisValue, ttl?: number) {
        const finalValue = typeof value === "string" ? value : JSON.stringify(value);

        if (typeof ttl === "number" && ttl > 0) {
            await this.redis.set(key, finalValue, 'EX', ttl);
        } else {
            await this.redis.set(key, finalValue);
        }
    }

    async saveMembersData(key: string, members: string | string[]) {
        if (Array.isArray(members)) {
            if (members.length === 0) return;
            await this.redis.sadd(key, ...members);
        } else {
            await this.redis.sadd(key, members);
        }
    }

    async getData<T>(key: string) {
        const data = await this.redis.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch {
            return data as T;
        }
    }

    async getMembers(key: string) {
        return await this.redis.smembers(key);
    }

    async deleteData(key: string | string[]) {
        if (Array.isArray(key)) {
            return await this.redis.del(...key);
        }
        await this.redis.del(key);
    }

    async removeMembersData(key: string, members: string | string[]) {
        if (Array.isArray(members)) {
            if (members.length === 0 ) return;
            await this.redis.srem(key, ...members);
        } else {
            await this.redis.srem(key, members);
        }
    }
}