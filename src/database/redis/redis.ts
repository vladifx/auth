import Redis from "ioredis";
import Config from "../../config/env";

export const redis = new Redis({
    host: Config.String("REDIS_HOST"),
    port: Config.Number("REDIS_PORT"),
    password: Config.String("REDIS_PASSWORD") || undefined,
});

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (err: Error) => {
    console.error("Redis error:", err);
});

export type RedisClient = typeof redis;