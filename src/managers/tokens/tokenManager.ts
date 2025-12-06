import jwt from "jsonwebtoken";
import Config from "../../config/env"
import { FastifyInstance } from "fastify";
import { TokenPair, TokenPayload } from "./interfaces";
import { RedisClient } from "../../clients/redisClient";

export class TokenManager {
    private redisClient: RedisClient;
    private readonly accessSecret: string;
    private readonly refreshSecret: string;

    constructor(app: FastifyInstance) {
        this.redisClient = new RedisClient(app);
        this.accessSecret = Config.String("JWT_ACCESS_SECRET");
        this.refreshSecret = Config.String("JWT_REFRESH_SECRET");
    }

    private ACCESS_TTL = 15 * 60;             // 15 minutes
    private REFRESH_TTL = 30 * 24 * 60 * 60;  // 30 days

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

    generateToken(payload: TokenPayload): TokenPair {
        const accessToken = jwt.sign(payload, this.accessSecret, {
            expiresIn: '15m'
        });

        const refreshToken = jwt.sign(payload, this.refreshSecret, {
            expiresIn: '30d'
        });

        return { accessToken, refreshToken };
    }

    async saveTokens(payload: TokenPayload, tokens: TokenPair) {
        await Promise.all([
            this.redisClient.saveData(
                this.accessKey(tokens.accessToken),
                [payload.userId, payload.sessionId],
                this.ACCESS_TTL),
            this.redisClient.saveMembersData(
                this.userAccessToken(payload.userId, payload.sessionId),
                tokens.accessToken
            ),

            this.redisClient.saveData(
                this.refreshKey(tokens.refreshToken),
                [payload.userId, payload.sessionId],
                this.REFRESH_TTL),
            this.redisClient.saveMembersData(
                this.userRefreshToken(payload.userId, payload.sessionId),
                tokens.refreshToken
            ),
        ]);
    }

    async removeSessionToken(userId: string, sessionId: string) {
        const [accessTokens, refreshTokens] = await Promise.all([
            this.redisClient.getMembers(this.userAccessToken(userId, sessionId)),
            this.redisClient.getMembers(this.userRefreshToken(userId, sessionId)),
        ]);

        const keysToDelete: string[] = [
            ...accessTokens.map(token => this.accessKey(token)),
            ...refreshTokens.map(token => this.refreshKey(token)),
        ];

        if (keysToDelete.length > 0) {
            await this.redisClient.deleteData(keysToDelete);
        }

        await this.redisClient.deleteData([
            this.userAccessToken(userId, sessionId),
            this.userRefreshToken(userId, sessionId),
        ]);
    }

    async removeAllUserTokens(userId: string) {
        const sessionKeys = await this.redisClient.getMembers(`user_session:${userId}`);
        if (!sessionKeys.length) return;

        for (const sessionId of sessionKeys) {
            const accessSetKey = this.userAccessToken(userId, sessionId);
            const refreshSetKey = this.userRefreshToken(userId, sessionId);

            const [accessTokens, refreshTokens] = await Promise.all([
                this.redisClient.getMembers(accessSetKey),
                this.redisClient.getMembers(refreshSetKey),
            ]);

            const keysToDelete: string[] = [
                ...accessTokens.map(token => this.accessKey(token)),
                ...refreshTokens.map(token => this.refreshKey(token)),
                `session:${sessionId}`,
                accessSetKey,
                refreshSetKey,
            ];

            if (keysToDelete.length > 0) {
                await this.redisClient.deleteData(keysToDelete);
            }
        }
    }

    async validateAccessToken(accessToken: string) {
        try {
            const payload = jwt.verify(
                accessToken,
                this.accessSecret
            ) as TokenPayload;

            const exists = await this.redisClient.getData<string>(this.accessKey(accessToken));
            if (!exists) return null;

            return payload;
        } catch (e) {
            return null;
        }
    }

    async validateRefreshToken(refreshToken: string) {
        try {
            const payload = jwt.verify(
                refreshToken,
                this.refreshSecret
            ) as TokenPayload;

            const exists = await this.redisClient.getData<boolean>(this.refreshKey(refreshToken));
            if (!exists) return null;

            return payload;
        } catch (e) {
            return null;
        }
    }
}