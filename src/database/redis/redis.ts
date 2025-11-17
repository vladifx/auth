import Redis from "ioredis";
import { env } from "../../config/env";

const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
});

export type RedisClient = typeof redis;

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (err: Error) => {
    console.error("Redis error:", err);
});

export default redis;