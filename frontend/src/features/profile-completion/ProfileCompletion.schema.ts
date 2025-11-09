import { z } from "zod";

export const profileCompletionSchema = z.object({
  firstname: z.string().min(1, "Le prénom est requis").optional(),
  lastname: z.string().min(1, "Le nom est requis").optional(),
});

export type ProfileCompletionCommand = z.infer<typeof profileCompletionSchema>;
