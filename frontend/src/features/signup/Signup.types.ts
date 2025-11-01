export interface SignupRequest {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}
export interface SignupResponse {
  success: boolean;
  message?: string;
  error?: string;
}
