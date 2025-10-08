export interface ConfirmHelperEmailRequest {
  token: string;
}

export interface ConfirmHelperEmailSuccessResponse {
  message: string;
}

export interface ConfirmHelperEmailErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
