export interface AuthRequest {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
}
