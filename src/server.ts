import { buildApp } from "./app";
import "dotenv/config";
import Config from "./config/env";
import { initPrisma } from "./database/prisma/prisma";

const start = async () => {
    const app = buildApp({ logger: true });

    await initPrisma();

    try {
        await app.listen({ port: Config.Number("PORT"), host: "0.0.0.0" });
        console.info(`Server started on port: ${process.env.PORT}`)
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();
