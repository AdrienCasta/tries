import { z } from "zod";
import { PROFESSION_CODES } from "../shared/constants/professions";
import { ALL_FRENCH_COUNTIES } from "../shared/constants/counties";
import { RESIDENCE_COUNTRY_CODES } from "../shared/constants/countries";

const phoneRegex = /^(\+33|0)[1-9]\d{8}$/;

export const onboardHelperSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
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
      .refine(
        (arr) => arr.every((code) => PROFESSION_CODES.includes(code as any)),
        { message: "Invalid profession selected" }
      ),
    rppsNumbers: z.record(
      z.string(),
      z.string().regex(/^\d{11}$/, "Rpps must be exactly 11 digits.")
    ),
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
        return age >= 16;
      }, "Must be at least 16 years old"),
    frenchCounty: z.string().optional(),
    countryOfBirth: z.string(),
    "city-of-birth": z.string().optional().or(z.literal("")),
    "city-of-birth-zip-code": z.string().optional().or(z.literal("")),
    countryOfResidence: z
      .string()
      .min(1, "Country of residence is required")
      .refine((val) => RESIDENCE_COUNTRY_CODES.includes(val as any), {
        message: "Invalid country of residence",
      }),
    professionalDescription: z
      .string()
      .min(
        50,
        "Please provide at least 50 characters describing your experience"
      )
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.countryOfResidence === "FR") {
        return data.frenchCounty && data.frenchCounty.length > 0;
      }
      return true;
    },
    {
      message: "French county is required for residents of France",
      path: ["frenchCounty"],
    }
  )
  .refine(
    (data) => {
      if (data.frenchCounty && data.frenchCounty.length > 0) {
        return ALL_FRENCH_COUNTIES.includes(data.frenchCounty);
      }
      return true;
    },
    {
      message: "Invalid French county",
      path: ["frenchCounty"],
    }
  )
  .refine(
    (data) => {
      return data.professions.every((profession) => {
        const rppsNumber = data.rppsNumbers[profession];
        return rppsNumber && rppsNumber.trim().length > 0;
      });
    },
    {
      message: "RPPS number is required for each profession",
      path: ["rppsNumbers"],
    }
  );
