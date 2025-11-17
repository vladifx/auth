import { z } from "zod";

const envSchema = z.object({
    PORT: z.string().optional().default("5000"),

    PG_HOST: z.string().default("localhost"),
    PG_PORT: z.string().default("5432"),
    PG_USER: z.string().default("postgres"),
    PG_PASSWORD: z.string().optional(),
    PG_DATABASE: z.string().default("task_auth"),

    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.string().default("6379"),
    REDIS_PASSWORD: z.string().optional(),

    JWT_ACCESS_TOKEN: z.string().default("some_access_secret_token"),
    JWT_REFRESH_TOKEN: z.string().default("some_refresh_secret_token"),
})

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variable: ", parsed.error.flatten());
    process.exit(1);
}

export const env = {
    ...parsed.data,
    PORT: Number(parsed.data.PORT),
    PG_PORT: Number(parsed.data.PG_PORT),
    REDIS_PORT: Number(parsed.data.REDIS_PORT),
}