export interface AuthUserRead {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  birthdate: string;
  placeOfBirth: {
    country: string;
    city: string;
  };
  professions: Array<{
    code: string;
    healthId: { rpps: string } | { adeli: string };
  }>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
  emailConfirmed: boolean;
}
export interface AuthUserWrite {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  birthdate: string;
  placeOfBirth: {
    country: string;
    city: string;
  };
  professions: Array<{
    code: string;
    healthId: { rpps: string } | { adeli: string };
  }>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
}
