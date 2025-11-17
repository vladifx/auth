import authService from "../services/authService.js";
import ApiError from "../exceptions/apiError.js";

class AuthController {
    async registration(request, reply) {
        const { username, password } = request.body;

        const userData = await authService.registration(username, password);
        return reply.send(userData);
    }

    async login(request, reply) {
        const { username, password } = request.body;

        const userData = await authService.login(username, password);
        return reply.send(userData);

    }

    async refresh(request, reply) {
        const { refreshToken } = request.body;

        const refreshedRefreshToken = await authService.refresh(refreshToken);
        return reply.send(refreshedRefreshToken);
    }

    async logout(request, reply) {
        const { refreshToken } = request.body;

        await authService.logout(refreshToken);
        return reply.send({ message: "You are logged out" });
    }
}

export default new AuthController();