import { z } from "zod";
import { ChangePasswordSchema } from "./request";
export * from "./request.js";
export * from "./response.js";

export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;