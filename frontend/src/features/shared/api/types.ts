import type {
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendOtpRequest,
  ResendOtpResponse,
} from "../../email-verification/EmailVerification.types";
import type { SignupRequest, SignupResponse } from "../../signup/Signup.types";

export interface IAuthRepository {
  signup(data: SignupRequest): Promise<SignupResponse>;
  verifyOtp(data: VerifyEmailRequest): Promise<VerifyEmailResponse>;
  resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse>;
}
