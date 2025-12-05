import fp from "fastify-plugin";
import { TokenManager } from "../managers/tokens/tokenManager"

export default fp(async (app) => {
    const tokenManager = new TokenManager(app);
    app.decorate("tokenManager", tokenManager);
})