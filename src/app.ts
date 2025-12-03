import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import errorMiddleware from "./middlewares/errorMiddleware";
import prismaPlugin from "./plugins/prisma";
import redisPlugin from "./plugins/redis";
import tokenPlugin from "./plugins/tokenService";
import authServicePlugin from "./plugins/authService";
import userServicePlugin from "./plugins/userService";
import authMiddlewarePlugin from "./plugins/authMiddleware";
import sessionPlugin from "./plugins/sessionRepo";
import rateLimitPlugin from "./plugins/rateLimit";
import emailPlugin from "./plugins/mailService";

export const buildApp = (options?: FastifyServerOptions): FastifyInstance => {
    const app = Fastify(options)
        .withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(prismaPlugin);
    app.register(redisPlugin);
    app.register(tokenPlugin);
    app.register(emailPlugin);
    app.register(authServicePlugin);
    app.register(sessionPlugin);
    app.register(authMiddlewarePlugin);
    app.register(userServicePlugin);
    app.register(rateLimitPlugin);

    app.register(authRoute, { prefix: "/auth" });
    app.register(userRoute, { prefix: "/user" });

    app.setErrorHandler(errorMiddleware);

    return app;
}