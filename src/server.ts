import { buildApp } from "./app";
import "dotenv/config";
import { initDB } from "./database/postgres/mainDB";
import { env } from "./config/env";

const start = async () => {
    const app = buildApp({ logger: true });

    try {
        await initDB();
        await app.listen({ port: env.PORT, host: "0.0.0.0" });
        console.info(`Server started on port: ${env.PORT}`)
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();
