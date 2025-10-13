export const VALID_PROFESSIONS = [
  { code: 'doctor', label: 'Doctor' },
  { code: 'physiotherapist', label: 'Physiotherapist' },
  { code: 'sports_coach', label: 'Sports Coach' },
] as const;

export const PROFESSION_CODES = VALID_PROFESSIONS.map(p => p.code);
export type ProfessionCode = typeof PROFESSION_CODES[number];
