export interface OnboardHelperCommand {
  email: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  professions: string[];
  rppsNumbers: Record<string, string>;
  birthdate: string;
  frenchCounty: string;
  countryOfBirth: string;
  "city-of-birth": string;
  "city-of-birth-zip-code": string;
  countryOfResidence: string;
  professionalDescription: string;
}
