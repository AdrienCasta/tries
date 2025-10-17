export interface OnboardHelperCommand {
  email: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  professions: string[];
  rppsNumbers: Record<string, string>;
  birthdate: string;
  frenchCounty: string;
  placeOfBirth: {
    country: string;
    city?: string;
    zipCode?: string;
  };
  countryOfResidence: string;
  professionalDescription?: string;
}
