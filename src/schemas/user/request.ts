import { z } from "zod";

export const ChangePasswordSchema = z.object({
    oldPassword: z.string().min(6).max(20),
    newPassword: z.string().min(6).max(20),
})