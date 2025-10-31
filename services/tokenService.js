import jwt from 'jsonwebtoken';
import redis from '../database/redis/redis.js';

class TokenService {
    generateToken(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        return { accessToken, refreshToken };
    }

    async saveRefreshToken(userId, refreshToken) {
        await redis.set(`refresh:${refreshToken}`, userId.toString(), 'EX', 30 * 24 * 60 * 60); //  30 * 24 * 60 * 60
        await redis.sadd(`user_refresh:${userId}`, refreshToken);
    }

    async removeRefreshToken(refreshToken) {
        const userId = await redis.get(`refresh:${refreshToken}`);
        if (userId) {
            await redis.srem(`user_refresh:${userId}`, refreshToken);
            await redis.del(`refresh:${refreshToken}`);
        }

    }

    async findToken(token) {
        const tokenData = await redis.get(token);
        return tokenData;
    }

    async validateAccessToken(accessToken) {
        try {
            return jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        } catch (e) {
            return null;
        }
    }

    async validateRefreshToken(refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const userData = await redis.get(`refresh:${refreshToken}`);
            if (!userData) return null;
            return payload;
        } catch (e) {
            return null;
        }
    }
}

export default new TokenService();