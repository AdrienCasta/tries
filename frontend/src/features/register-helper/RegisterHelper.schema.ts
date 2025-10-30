import { z } from "zod";
import { PROFESSION_CODES } from "../shared/constants/professions";
import { ALL_FRENCH_AREAS } from "../shared/constants/frenchAreas";

const phoneRegex = /^(\+33|0)[1-9]\d{8}$/;
const MINIMUM_AGE = 16;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const healthIdSchema = z.union([
  z.object({ rpps: z.string().regex(/^\d{11}$/, "RPPS must be exactly 11 digits") }),
  z.object({ adeli: z.string().regex(/^\d{9}$/, "ADELI must be exactly 9 digits") }),
]);

const credentialSchema = z.object({
  fileType: z.string(),
  fileSize: z.number().optional(),
});

export const registerHelperSchema = z.object({
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password too short")
    .regex(/[A-Z]/, "Password format invalid")
    .regex(/[a-z]/, "Password format invalid")
    .regex(/[0-9]/, "Password format invalid")
    .regex(/[^A-Za-z0-9]/, "Password format invalid"),
  firstname: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastname: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Invalid phone number format"),
  professions: z
    .array(
      z.object({
        code: z.string(),
        healthId: healthIdSchema,
        credential: credentialSchema.optional(),
      })
    )
    .min(1, "At least one profession is required")
    .refine(
      (arr) => arr.every((prof) => PROFESSION_CODES.includes(prof.code)),
      {
        message: "Invalid profession selected",
      }
    ),
  birthdate: z.string().refine((val) => {
    const date = new Date(val);
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= MINIMUM_AGE;
  }, `Must be at least ${MINIMUM_AGE} years old`),
  placeOfBirth: z.object({
    country: z.string().min(1, "Country of birth is required"),
    city: z.string().min(1, "City of birth is required"),
  }),
  residence: z.object({
    country: z.string().min(1, "Country of residence is required"),
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
      message: "French county is required for residents of France",
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
      message: "Invalid French county",
      path: ["residence", "frenchAreaCode"],
    }
  );
