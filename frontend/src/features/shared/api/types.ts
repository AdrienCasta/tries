import type { OnboardHelperCommand } from "../../register-helper/RegisterHelper.types";
import type SignupCommand from "../../signup/Signup.types";
import type {
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendOtpRequest,
  ResendOtpResponse,
} from "../../email-verification/EmailVerification.types";

export interface OnboardHelperResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SignupResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface IHelperRepository {
  onboard(data: OnboardHelperCommand): Promise<OnboardHelperResult>;
}

export interface IAuthRepository {
  signup(data: SignupCommand): Promise<SignupResult>;
  verifyOtp(data: VerifyEmailRequest): Promise<VerifyEmailResponse>;
  resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse>;
}
