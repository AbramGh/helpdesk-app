import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const mfaVerifySchema = z.object({
  token: z.string().length(6, "TOTP token must be 6 digits"),
  trustDevice: z.boolean().optional(),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
})
