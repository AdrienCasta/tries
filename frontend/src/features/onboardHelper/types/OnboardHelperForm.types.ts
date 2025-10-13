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
  countryOfResidence: string;
  professionalDescription: string;
}
