import { z } from "zod";

export const authSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
});

export type AuthCommand = z.infer<typeof authSchema>;
