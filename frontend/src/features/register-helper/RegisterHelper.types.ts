export default interface RegisterHelperCommand {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthdate: Date;
  placeOfBirth: {
    country: string;
    city: string;
  };
  professions: Array<{
    code: string;
    healthId: { rpps: string } | { adeli: string };
    credential?: {
      fileType: string;
      fileSize?: number;
    };
  }>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
  criminalRecordCertificate?: {
    fileType: string;
    fileSize?: number;
  };
}
