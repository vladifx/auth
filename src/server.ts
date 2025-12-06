import { buildApp } from "./app";
import "dotenv/config";
import Config from "./config/env";
import { initPrisma } from "./database/prisma/prisma";

const start = async () => {
    const app = buildApp({ logger: true });

    await initPrisma();

    try {
        await app.listen({ port: Config.Number("PORT"), host: "0.0.0.0" });
        app.log.info(`Server started on port: ${process.env.PORT}`)
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

start();
