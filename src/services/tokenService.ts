import jwt from "jsonwebtoken";
import Config from "../config/env"
import { FastifyInstance } from "fastify";
import { TokenRepo } from "../repository/tokenRepo"

export interface TokenPayload {
    userId: string;
    sessionId: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class TokenService {
    private cache: TokenRepo;
    private readonly accessSecret: string;
    private readonly refreshSecret: string;

    constructor(app: FastifyInstance) {
        this.cache = new TokenRepo(app);
        this.accessSecret = Config.String("JWT_ACCESS_SECRET");
        this.refreshSecret = Config.String("JWT_REFRESH_SECRET");
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
            this.cache.saveAccessToken(payload.userId, payload.sessionId, tokens.accessToken),
            this.cache.saveRefreshToken(payload.userId, payload.sessionId, tokens.refreshToken),
        ])
    }

    async removeSessionToken(payload: TokenPayload) {
        await this.cache.removeSessionToken(payload.userId, payload.sessionId);
    }

    async removeAllUserTokens(userId: string) {
        await this.cache.removeAllUserTokens(userId);
    }

    async validateAccessToken(accessToken: string) {
        try {
            const payload = jwt.verify(
                accessToken,
                this.accessSecret
            ) as TokenPayload;

            const exists = await this.cache.isAccessTokenValid(accessToken);
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

            const exists = await this.cache.isRefreshTokenValid(refreshToken);
            if (!exists) return null;

            return payload;
        } catch (e) {
            return null;
        }
    }
}