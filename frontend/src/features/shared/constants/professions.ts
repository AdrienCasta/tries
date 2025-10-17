export const VALID_PROFESSIONS = [
  { code: 'doctor', label: 'Doctor' },
  { code: 'physiotherapist', label: 'Physiotherapist' },
  { code: 'sports_coach', label: 'Sports Coach' },
] as const;

export const PROFESSION_CODES = VALID_PROFESSIONS.map(p => p.code) as readonly string[];
export type ProfessionCode = typeof VALID_PROFESSIONS[number]['code'];
