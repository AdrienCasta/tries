export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
}

export type ProfileStatus = "incomplete" | "completed";

export interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    emailConfirmed: boolean;
    profileStatus: ProfileStatus;
    firstname?: string;
    lastname?: string;
  };
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
