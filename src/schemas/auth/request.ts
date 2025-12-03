import { z } from "zod";

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(20),
    username: z.string().min(3).max(20),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(20),
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1),
});

export const ActivateParamsSchema = z.object({
    token: z.string().uuid(),
});

export const ResendActivationSchema = z.object({
    email: z.string().email(),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
    newPassword: z.string().min(6).max(20),
});

export const ResetPasswordParamsSchema = z.object({
    token: z.string().uuid(),
})