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
    credentialFileId?: string;
  }>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
  emailConfirmed: boolean;
  criminalRecordCertificateId?: string;
}
export interface AuthUserWrite {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  birthdate: string;
  criminalRecordCertificateId?: string;
  placeOfBirth: {
    country: string;
    city: string;
  };
  professions: Array<{
    code: string;
    healthId: { rpps: string } | { adeli: string };
    credentialId?: string;
  }>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
}
