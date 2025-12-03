import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

export default fp(async (app) => {
    app.register(rateLimit, {
        global: false,
        redis: app.redis,
        max: 100,
        timeWindow: "1 minute",
        ban: 0,
        keyGenerator: (req) => {
            return req.headers["x-real-ip"] as string
            || req.ip
            || "unknown";
        }
    });
});