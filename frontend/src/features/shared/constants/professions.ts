export const PROFESSIONS = [
  { code: "doctor", label: "Doctor", heathIdType: "rpps" },
  { code: "physiotherapist", label: "Physiotherapist", heathIdType: "rpps" },
  { code: "sports_coach", label: "Sports Coach", heathIdType: "rpps" },
] as const;

export const PROFESSION_CODES = PROFESSIONS.map(
  (p) => p.code
) as readonly string[];
export type ProfessionCode = (typeof PROFESSIONS)[number]["code"];
