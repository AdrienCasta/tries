export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface EmailVerificationState {
  isVerifying: boolean;
  isResending: boolean;
  verificationError: string | null;
  resendError: string | null;
  isVerified: boolean;
  lastResendTime: number | null;
}
