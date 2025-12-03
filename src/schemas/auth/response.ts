import { z } from "zod";

export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    isEmailVerified: z.boolean(),
    createdAt: z.date().transform((d) => d.toISOString()),
});

export const AuthResponseSchema = z.object({
    user: UserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
    sessionId: z.string().uuid(),
});

export const RefreshResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    sessionId: z.string().uuid(),
});

export const RegistrationResponseSchema = z.object({
    message: z.string()
});