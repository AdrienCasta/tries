export interface OnboardHelperRequest {
  email: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  birthdate: string;
  professions: string[];
  frenchCounty: string;
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
