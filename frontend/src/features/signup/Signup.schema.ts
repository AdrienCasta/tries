import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  firstname: z
    .string()
    .min(1, "Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastname: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
});

export type SignupCommand = z.infer<typeof signupSchema>;
