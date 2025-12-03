import fp from "fastify-plugin";
import { UserService } from "../services/userService.js";

export default fp(async (app) => {
    const userService = new UserService(app);
    app.decorate("userService", userService);
});