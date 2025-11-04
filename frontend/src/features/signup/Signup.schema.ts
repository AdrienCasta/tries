import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
});

export type SignupCommand = z.infer<typeof signupSchema>;
