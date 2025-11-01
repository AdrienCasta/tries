import { z } from "zod";

export const emailVerificationSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  otpCode: z
    .string()
    .length(6, "Le code OTP doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Le code OTP ne doit contenir que des chiffres"),
});

export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
