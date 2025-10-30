export const RESIDENCE_COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgium" },
  { code: "DE", label: "Germany" },
  { code: "CH", label: "Switzerland" },
] as const;

export const RESIDENCE_COUNTRY_CODES = RESIDENCE_COUNTRIES.map(
  (c) => c.code
) as readonly string[];
export type ResidenceCountryCode = (typeof RESIDENCE_COUNTRIES)[number]["code"];
