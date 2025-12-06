import { z } from "zod";
import {
    RegisterSchema, LoginSchema, RefreshTokenSchema, ResendActivationSchema,
    ForgotPasswordSchema, ResetPasswordSchema, ResetPasswordParamsSchema, ActivateParamsSchema,
} from "./request.js";
export * from "./request.js";
export * from "./response.js";

export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
export type ActivateParamsRequest = z.infer<typeof ActivateParamsSchema>;
export type ResendActivationRequest = z.infer<typeof ResendActivationSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type ResetPasswordParamsRequest = z.infer<typeof ResetPasswordParamsSchema>;