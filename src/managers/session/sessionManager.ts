import { FastifyInstance } from "fastify";
import { RedisClient } from "../../clients/redisClient";
import { SessionData } from "./interfaces"


export class SessionManager {
    private redisClient;
    private SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

    constructor(app: FastifyInstance) {
        this.redisClient = new RedisClient(app)
    }

    private sessionKey(sessionId: string) {
        return `session:${sessionId}`;
    }
    private userSessionKey(userId: string) {
        return `user_session:${userId}`;
    }

    async createSession(sessionId: string, data: SessionData) {
        await Promise.all ([
            this.redisClient.saveData(this.sessionKey(sessionId), data, this.SESSION_TTL),
            this.redisClient.saveMembersData(this.userSessionKey(data.userId), sessionId),
        ])
    }

    async getSession(sessionId: string) {
        return this.redisClient.getData<SessionData>(
            this.sessionKey(sessionId)
        );
    }

    async deleteSession(sessionId: string) {
        const data = await this.redisClient.getData<SessionData>(
            this.sessionKey(sessionId));
        if (!data) return null;

        await Promise.all ([
            this.redisClient.deleteData(this.sessionKey(sessionId)),
            this.redisClient.removeMembersData(this.userSessionKey(data.userId), sessionId),
        ]);
    }

    async deleteAllUserSessions(userId: string) {
        const sessions = await this.redisClient.getMembers(this.userSessionKey(userId));
        if (sessions.length) {
            const keys = sessions.map((id) => this.sessionKey(id));
            await this.redisClient.deleteData(keys);
        }
        await this.redisClient.deleteData(this.userSessionKey(userId));
    }
}