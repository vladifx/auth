import fp from "fastify-plugin"
import { authMiddleware} from "../middlewares/authMiddleware";

export default fp(async (app) => {
    app.decorate("authenticate", authMiddleware);
})