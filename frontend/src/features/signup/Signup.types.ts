export interface SignupRequest {
  email: string;
  firstname: string;
  lastname: string;
}
export interface SignupResponse {
  success: boolean;
  message?: string;
  error?: string;
}
