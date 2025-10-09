export const VALID_PROFESSIONS = [
  'doctor',
  'physiotherapist',
  'sports_coach',
] as const

export type Profession = typeof VALID_PROFESSIONS[number]
