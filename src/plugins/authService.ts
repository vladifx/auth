import fp from "fastify-plugin";
import { AuthService } from "../services/authService.js";

export default fp(async (app) => {
    const authService = new AuthService(app);
    app.decorate("authService", authService);
});