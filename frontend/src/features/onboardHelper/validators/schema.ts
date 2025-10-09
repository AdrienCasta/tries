import { z } from 'zod'
import { VALID_PROFESSIONS } from '../constants/professions'
import { ALL_FRENCH_COUNTIES } from '../constants/frenchCounties'

const phoneRegex = /^(\+33|0)[1-9]\d{8}$/

export const onboardHelperSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  firstname: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastname: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone number format'),
  profession: z
    .string()
    .min(1, 'Profession is required')
    .refine((val) => VALID_PROFESSIONS.includes(val as any), {
      message: 'Invalid profession',
    }),
  birthdate: z
    .string()
    .min(1, 'Birthdate is required')
    .refine((val) => {
      const date = new Date(val)
      return date < new Date()
    }, 'Birthdate cannot be in the future')
    .refine((val) => {
      const date = new Date(val)
      const age = new Date().getFullYear() - date.getFullYear()
      return age >= 16
    }, 'Must be at least 16 years old'),
  frenchCounty: z
    .string()
    .min(1, 'French county is required')
    .refine((val) => ALL_FRENCH_COUNTIES.includes(val), {
      message: 'Invalid French county',
    }),
})
