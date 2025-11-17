import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import errorMiddleware from "./middlewares/errorMiddleware";

export const buildApp = (options?: FastifyServerOptions): FastifyInstance => {
    const app = Fastify(options);

    app.register(authRoute, { prefix: "/auth" });
    app.register(userRoute, { prefix: "/user" });

    app.setErrorHandler(errorMiddleware);

    return app;
}

