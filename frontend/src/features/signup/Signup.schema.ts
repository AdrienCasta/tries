import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(8, "Mot de passe trop court")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Format de mot de passe invalide"
      ),
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SignupCommand = z.infer<typeof signupSchema>;
