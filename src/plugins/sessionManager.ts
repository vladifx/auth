import fp from "fastify-plugin";
import { SessionManager } from "../managers/session/sessionManager";

export default fp(async (app) => {
    const sessionManager = new SessionManager(app);
    app.decorate("sessionManager", sessionManager);
})