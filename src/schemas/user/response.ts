import { z } from "zod";

export const UserProfileSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string(),
    isEmailVerified: z.boolean(),
    createdAt: z.string().datetime(),
})

export const USER_SELECT = Object.fromEntries(
    Object.keys(UserProfileSchema.shape).map(k => [k, true])
) as Record<keyof z.infer<typeof UserProfileSchema>, true>;