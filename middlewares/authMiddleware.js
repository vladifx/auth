import jwt from 'jsonwebtoken';
import pool from '../database/postgres/mainDB.js';
import ApiError from "../exceptions/apiError.js";

export default async function authMiddleware(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) throw ApiError.UnauthorizedError();

        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) throw ApiError.UnauthorizedError();

        const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        if (!payload) throw ApiError.UnauthorizedError();

        const initializedUser = await pool.query('SELECT id, username, created_at FROM users WHERE id=$1', [payload.id]);
        if (!initializedUser.rows.length) return reply.code(401).send({ message: 'User not found' });

        request.user = initializedUser.rows[0];
    } catch (e) {
        throw ApiError.UnauthorizedError()
    }
}