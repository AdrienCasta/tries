import { z } from "zod";

export const emailVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  otpCode: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
