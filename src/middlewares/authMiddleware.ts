import { FastifyRequest, FastifyReply } from "fastify";
import ApiError from "../exceptions/apiError";

export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) throw ApiError.UnauthorizedError();

        const token = authHeader.split(" ")[1];
        if (!token) throw ApiError.UnauthorizedError();

        const payload = await request.server.tokenService.validateAccessToken(token);
        if (!payload) throw ApiError.UnauthorizedError();

        const session = await request.server.session.getSession(payload.sessionId);
        if (!session || session.userId !== payload.userId) throw ApiError.UnauthorizedError();

        request.user = payload;
    } catch (e) {
        throw ApiError.UnauthorizedError();
    }
}