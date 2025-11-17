import pool from "../database/postgres/mainDB.js";
import bcrypt from "bcryptjs";
import tokenService from "./tokenService.js";
import ApiError from "../exceptions/apiError.js"

class AuthService {
    async registration(username, password) {
        const candidate = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
        if (candidate.rows.length) {
            throw ApiError.BadRequest(`Username "${username}" already exists`);
        }
        const hashedPassword = await bcrypt.hash(password, 5);
        const userResult = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );

        const user = userResult.rows[0];

        const tokens = tokenService.generateToken({ id: user.id, username: user.username });
        await tokenService.saveRefreshToken(user.id, tokens.refreshToken);
        return { user, ...tokens }
    }

    async login(username, password) {
        const candidate = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
        if (!candidate.rows.length) throw ApiError.BadRequest(`User not found`);

        const user = candidate.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw ApiError.BadRequest(`Invalid password`);

        const tokens = tokenService.generateToken({ id: user.id, username: user.username });
        await tokenService.saveRefreshToken(user.id, tokens.refreshToken);

        return { user, ...tokens }
    }

    async refresh(refreshToken) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const payload = await tokenService.validateRefreshToken(refreshToken);
        const tokenFromRedis = await tokenService.findToken(`refresh:${refreshToken}`);
        if (!payload || !tokenFromRedis) throw ApiError.UnauthorizedError();

        await tokenService.removeRefreshToken(refreshToken);

        const tokens = tokenService.generateToken({ id: payload.id, username: payload.username });
        await tokenService.saveRefreshToken(payload.id, tokens.refreshToken);

        return { ...tokens }
    }

    async logout(refreshToken) {
        if (!refreshToken) throw ApiError.UnauthorizedError();

        const payload = await tokenService.validateRefreshToken(refreshToken);
        if (!payload) throw ApiError.BadRequest(`Invalid refresh token`);

        await tokenService.removeRefreshToken(refreshToken);
    }
}

export default new AuthService();