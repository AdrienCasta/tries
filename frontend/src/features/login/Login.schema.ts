import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
});

export type LoginCommand = z.infer<typeof loginSchema>;
