export default interface RegisterHelperCommand {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  birthdate: Date;
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
  diploma?: {
    fileType: string;
    fileSize?: number;
  };
  criminalRecordCertificate?: {
    fileType: string;
    fileSize?: number;
  };
}
