import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import errorMiddleware from "./middlewares/errorMiddleware";
import appPlugins from "./plugins";

export const buildApp = (options?: FastifyServerOptions): FastifyInstance => {
    const app = Fastify(options)
        .withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(appPlugins)

    app.register(authRoute, { prefix: "/auth" });
    app.register(userRoute, { prefix: "/user" });

    app.setErrorHandler(errorMiddleware);

    return app;
}