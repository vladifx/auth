import { FastifyInstance } from "fastify";

export interface SessionData {
    userId: string;
    ip?: string;
    userAgent?: string;
    createdAt: string;
}

export class SessionRepo {
    private redis;
    private SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

    constructor(app: FastifyInstance) {
        this.redis = app.redis;
    }

    private sessionKey(sessionId: string) {
        return `session:${sessionId}`;
    }
    private userSessionKey(userId: string) {
        return `user_session:${userId}`;
    }

    async createSession(sessionId: string, data: SessionData) {
        await Promise.all ([
            this.redis.set(this.sessionKey(sessionId),
                JSON.stringify(data),
                "EX", this.SESSION_TTL),
            this.redis.sadd(this.userSessionKey(data.userId), sessionId),
        ])
    }

    async getSession(sessionId: string) {
        const data = await this.redis.get(this.sessionKey(sessionId));
        if (!data) return null;

        return JSON.parse(data) as SessionData;
    }

    async deleteSession(sessionId: string) {
        const raw = await this.redis.get(this.sessionKey(sessionId));
        if (!raw) return null;

        const data = JSON.parse(raw) as SessionData;

        await Promise.all ([
            this.redis.del(this.sessionKey(sessionId)),
            this.redis.srem(this.userSessionKey(data.userId), sessionId),
        ]);
    }

    async deleteAllUserSessions(userId: string) {
        const sessions = await this.redis.smembers(this.userSessionKey(userId));
        if (sessions.length) {
            const keys = sessions.map((id) => this.sessionKey(id));
            await this.redis.del(...keys);
        }
        await this.redis.del(this.userSessionKey(userId));
    }

    async sessionExists(sessionId: string) {
        return Boolean(
            await this.redis.exists(`session:${sessionId}`),
        )
    }
}