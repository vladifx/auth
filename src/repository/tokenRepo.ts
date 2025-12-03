import { FastifyInstance } from "fastify";
import { TokenPayload } from "../services/tokenService";

export class TokenRepo {
    private redis;
    private ACCESS_TTL = 15 * 60; // 15 minutes
    private REFRESH_TTL = 30 * 24 * 60 * 60; // 30 days

    constructor(app: FastifyInstance) {
        this.redis = app.redis;
    }

    private accessKey(token: string) {
        return `access:${token}`;
    }
    private refreshKey(token: string) {
        return `refresh:${token}`;
    }
    private userAccessToken(userId: string, sessionId: string) {
        return `user_access:${userId}:${sessionId}`;
    }
    private userRefreshToken(userId: string, sessionId: string) {
        return `user_refresh:${userId}:${sessionId}`;
    }

// Save tokens
    async saveAccessToken(userId: string, sessionId: string, token: string) {
        await Promise.all([
            this.redis.set(
                this.accessKey(token),
                JSON.stringify({userId, sessionId}),
                "EX", this.ACCESS_TTL
            ),
            this.redis.sadd(this.userAccessToken(userId, sessionId), token),
        ])
    }

    async saveRefreshToken(userId: string, sessionId: string, token: string) {
        await Promise.all([
            this.redis.set(
                this.refreshKey(token),
                JSON.stringify({userId, sessionId}),
                "EX", this.REFRESH_TTL
            ),
            this.redis.sadd(this.userRefreshToken(userId, sessionId), token),
        ])
    }

// Remove tokens
    async removeAccessToken(accessToken: string) {
        const raw = await this.redis.get(this.accessKey(accessToken));
        if (!raw) return;

        const { userId, sessionId } = JSON.parse(raw);

        await Promise.all([
            this.redis.del(this.accessKey(accessToken)),
            this.redis.srem(this.userAccessToken(userId, sessionId), accessToken),
        ]);
    }

    async removeRefreshToken(refreshToken: string) {
        const raw = await this.redis.get(this.refreshKey(refreshToken));
        if (!raw) return;

        const { userId, sessionId } = JSON.parse(raw);

        await Promise.all([
            this.redis.del(this.refreshKey(refreshToken)),
            this.redis.srem(
                this.userRefreshToken(userId, sessionId),
                refreshToken
            )
        ]);
    }

    async removeAllUserTokens(userId: string) {
        const sessionKeys = await this.redis.smembers(`user_session:${userId}`);
        if (!sessionKeys.length) return;

        for (const sessionId of sessionKeys) {
            const accessSetKey = this.userAccessToken(userId, sessionId);
            const refreshSetKey = this.userRefreshToken(userId, sessionId);

            const [accessTokens, refreshTokens] = await Promise.all([
                this.redis.smembers(accessSetKey),
                this.redis.smembers(refreshSetKey),
            ]);

            const keysToDelete = [
                ...accessTokens.map(token => this.accessKey(token)),
                ...refreshTokens.map(token => this.refreshKey(token)),
                `session:${sessionId}`,
                accessSetKey,
                refreshSetKey
            ];

            if (keysToDelete.length) {
                await this.redis.del(...keysToDelete);
            }
        }
    }

    async removeSessionToken(userId: string, sessionId: string) {
        const [accessTokens, refreshTokens] = await Promise.all([
            this.redis.smembers(this.userAccessToken(userId, sessionId)),
            this.redis.smembers(this.userRefreshToken(userId, sessionId)),
        ])

        const keysToDelete: string[] = [
            ...accessTokens.map((token) => this.accessKey(token)),
            ...refreshTokens.map((token) => this.refreshKey(token)),
        ];

        if (keysToDelete.length) {
            await this.redis.del(...keysToDelete);
        }

        await Promise.all([
            this.redis.del(this.userAccessToken(userId, sessionId)),
            this.redis.del(this.userRefreshToken(userId, sessionId)),
        ])
    }

// Find tokens
    async findAccessTokenByUserId(userId: string): Promise<string | null> {
        const tokens = await this.redis.smembers(`user_access:${userId}`);
        return tokens[0] ?? null;
    }

    async findRefreshToken(refreshToken: string) {
        return await this.redis.get(this.refreshKey(refreshToken));
    }

// Check valid
    async isAccessTokenValid(accessToken: string) {
        const exists = await this.redis.get(this.accessKey(accessToken));
        return Boolean(exists);
    }

    async isRefreshTokenValid(refreshToken: string) {
        const exists = await this.redis.get(this.refreshKey(refreshToken));
        return Boolean(exists);
    }

    async getRefreshMetaData(refreshToken: string): Promise<TokenPayload | null> {
        const raw = await this.redis.get(this.refreshKey(refreshToken));
        if (!raw) return null;
        return JSON.parse(raw);
    }
}