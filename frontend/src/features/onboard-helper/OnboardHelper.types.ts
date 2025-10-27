export interface OnboardHelperCommand {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  birthdate: string;
  professionalDescription?: string;
  professions: {
    code: string;
    healthId: Record<"adeli" | "rpps", string>;
    credential?: {
      fileType: string;
      fileSize: number;
    };
  }[];
  placeOfBirth: {
    country: string;
    city: string;
  };
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
}
