import fp from "fastify-plugin";
import { redis, RedisClient } from "../database/redis/redis"

export default fp(async (app) => {
    app.decorate("redis", redis as RedisClient);

    app.addHook("onClose", async () => {
        await redis.quit();
    });
});