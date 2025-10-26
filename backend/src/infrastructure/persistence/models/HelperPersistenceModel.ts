export type HelperPersistenceModel = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: Date;
  birth_country_code: string;
  birth_city: string;
  residence_country_code: string;
  residence_french_county_code: string;
  status: "pending_review" | "incomplete";
};
