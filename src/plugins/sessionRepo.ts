import fp from "fastify-plugin";
import { SessionRepo } from "../repository/sessionRepo";

export default fp(async (app) => {
    const session = new SessionRepo(app);
    app.decorate("session", session);
})