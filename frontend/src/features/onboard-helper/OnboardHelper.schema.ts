import { z } from "zod";
import { PROFESSION_CODES } from "../shared/constants/professions";
import { ALL_FRENCH_COUNTIES } from "../shared/constants/counties";
import { RESIDENCE_COUNTRY_CODES } from "../shared/constants/countries";

const phoneRegex = /^(\+33|0)[1-9]\d{8}$/;
const MINIMUM_AGE = 16;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const onboardHelperSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
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
      .array(z.string())
      .min(1, "At least one profession is required")
      .refine((arr) => arr.every((code) => PROFESSION_CODES.includes(code)), {
        message: "Invalid profession selected",
      }),
    rppsNumbers: z.record(
      z.string(),
      z.string().regex(/^\d{11}$/, "Rpps must be exactly 11 digits.")
    ),
    credentialFiles: z.record(z.string(), z.union([z.instanceof(File), z.undefined()])).optional(),
    birthdate: z
      .string()
      .min(1, "Birthdate is required")
      .refine((val) => {
        const date = new Date(val);
        return date < new Date();
      }, "Birthdate cannot be in the future")
      .refine((val) => {
        const date = new Date(val);
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= MINIMUM_AGE;
      }, `Must be at least ${MINIMUM_AGE} years old`),
    frenchAreaCode: z.string().optional(),
    placeOfBirth: z.object({
      country: z.string().min(1, "Country of birth is required"),
      city: z.string().optional(),
      zipCode: z.string().optional(),
    }),
    countryOfResidence: z
      .string()
      .min(1, "Country of residence is required")
      .refine((val) => RESIDENCE_COUNTRY_CODES.includes(val), {
        message: "Invalid country of residence",
      }),
    professionalDescription: z
      .string()
      .min(
        50,
        "Please provide at least 50 characters describing your experience"
      )
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.countryOfResidence === "FR") {
        return data.frenchAreaCode && data.frenchAreaCode.length > 0;
      }
      return true;
    },
    {
      message: "French county is required for residents of France",
      path: ["frenchAreaCode"],
    }
  )
  .refine(
    (data) => {
      if (data.frenchAreaCode && data.frenchAreaCode.length > 0) {
        return ALL_FRENCH_COUNTIES.includes(data.frenchAreaCode);
      }
      return true;
    },
    {
      message: "Invalid French county",
      path: ["frenchAreaCode"],
    }
  )
  .refine(
    (data) => {
      return data.professions.every((profession) => {
        const rppsNumber = data.rppsNumbers[profession];
        return rppsNumber && rppsNumber.length > 0;
      });
    },
    {
      message: "RPPS number is required for each profession",
      path: ["rppsNumbers"],
    }
  )
  .refine(
    (data) => {
      if (!data.credentialFiles) return true;
      const files = Object.values(data.credentialFiles).filter((file): file is File => file instanceof File);
      if (files.length === 0) return true;
      return files.every((file) => file.type === "application/pdf");
    },
    {
      message: "Credential must be in PDF format",
      path: ["credentialFiles"],
    }
  )
  .refine(
    (data) => {
      if (!data.credentialFiles) return true;
      const files = Object.values(data.credentialFiles).filter((file): file is File => file instanceof File);
      if (files.length === 0) return true;
      return files.every((file) => file.size <= MAX_FILE_SIZE);
    },
    {
      message: "Credential file size exceeds 10MB limit",
      path: ["credentialFiles"],
    }
  )
