import fp from "fastify-plugin";
import { TokenService } from "../services/tokenService"

export default fp(async (app) => {
    const tokenService = new TokenService(app);
    app.decorate("tokenService", tokenService);
})