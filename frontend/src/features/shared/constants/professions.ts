export const PROFESSIONS = [
  { code: "doctor", label: "Médecin", heathIdType: "rpps" },
  { code: "physiotherapist", label: "Kinésithérapeute", heathIdType: "rpps" },
  { code: "sports_coach", label: "Coach sportif", heathIdType: "rpps" },
] as const;

export const PROFESSION_CODES = PROFESSIONS.map(
  (p) => p.code
) as readonly string[];
export type ProfessionCode = (typeof PROFESSIONS)[number]["code"];
