export interface OnboardHelperCommand {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  professions: string[];
  rppsNumbers: Record<string, string>;
  credentialFiles: Record<string, File>;
  birthdate: string;
  frenchAreaCode: string;
  placeOfBirth: {
    country: string;
    city?: string;
    zipCode?: string;
  };
  countryOfResidence: string;
  professionalDescription?: string;
}
