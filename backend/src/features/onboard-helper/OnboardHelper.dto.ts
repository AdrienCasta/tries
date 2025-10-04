export interface OnboardHelperRequest {
  email: string;
  firstname: string;
  lastname: string;
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
