export interface SignupRequest {
  email: string;
}
export interface SignupResponse {
  success: boolean;
  message?: string;
  error?: string;
}
