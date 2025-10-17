export interface OnboardHelperRequest {
  email: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  birthdate: string;
  professions: {
    code: string;
    healthId: { rpps: string } | { adeli: string };
  }[];
  residence: {
    country: string;
    frenchCounty: string;
  };
  placeOfBirth: {
    country: string;
    city: string;
    zipCode?: string;
  };
}

export interface OnboardHelperSuccessResponse {
  helperId: string;
  message: string;
}

export interface OnboardHelperErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
