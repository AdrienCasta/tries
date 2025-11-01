import { z } from "zod";
import { PROFESSION_CODES } from "../shared/constants/professions";
import { ALL_FRENCH_AREAS } from "../shared/constants/frenchAreas";

const phoneRegex = /^(\+33|0)[1-9]\d{8}$/;
const MINIMUM_AGE = 16;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const healthIdSchema = z.union([
  z.object({ rpps: z.string().regex(/^\d{11}$/, "Le RPPS doit contenir exactement 11 chiffres") }),
  z.object({ adeli: z.string().regex(/^\d{9}$/, "L'ADELI doit contenir exactement 9 chiffres") }),
]);

const credentialSchema = z.object({
  fileType: z.string(),
  fileSize: z.number().optional(),
});

export const registerHelperSchema = z.object({
  email: z.email("Format d'email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Mot de passe trop court")
    .regex(/[A-Z]/, "Format de mot de passe invalide")
    .regex(/[a-z]/, "Format de mot de passe invalide")
    .regex(/[0-9]/, "Format de mot de passe invalide")
    .regex(/[^A-Za-z0-9]/, "Format de mot de passe invalide"),
  firstname: z
    .string()
    .min(1, "Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastname: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  phoneNumber: z
    .string()
    .min(1, "Le numéro de téléphone est requis")
    .regex(phoneRegex, "Format de numéro de téléphone invalide"),
  professions: z
    .array(
      z.object({
        code: z.string(),
        healthId: healthIdSchema,
        credential: credentialSchema.optional(),
      })
    )
    .min(1, "Au moins une profession est requise")
    .refine(
      (arr) => arr.every((prof) => PROFESSION_CODES.includes(prof.code)),
      {
        message: "Profession invalide sélectionnée",
      }
    ),
  birthdate: z.string().refine((val) => {
    const date = new Date(val);
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= MINIMUM_AGE;
  }, `Vous devez avoir au moins ${MINIMUM_AGE} ans`),
  placeOfBirth: z.object({
    country: z.string().min(1, "Le pays de naissance est requis"),
    city: z.string().min(1, "La ville de naissance est requise"),
  }),
  residence: z.object({
    country: z.string().min(1, "Le pays de résidence est requis"),
    frenchAreaCode: z.string().optional(),
  }),
  criminalRecordCertificate: credentialSchema.optional(),
})
  .refine(
    (data) => {
      if (data.residence.country === "FR") {
        return !!data.residence.frenchAreaCode;
      }
      return true;
    },
    {
      message: "Le département français est requis pour les résidents de France",
      path: ["residence", "frenchAreaCode"],
    }
  )
  .refine(
    (data) => {
      if (!!data.residence.frenchAreaCode) {
        return ALL_FRENCH_AREAS.includes(data.residence.frenchAreaCode);
      }
      return true;
    },
    {
      message: "Département français invalide",
      path: ["residence", "frenchAreaCode"],
    }
  );
