import type {
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendOtpRequest,
  ResendOtpResponse,
} from "../../email-verification/EmailVerification.types";
import type { SignupRequest, SignupResponse } from "../../signup/Signup.types";
import type { LoginRequest, LoginResponse } from "../../login/Login.types";

export interface IAuthRepository {
  signup(data: SignupRequest): Promise<SignupResponse>;
  login(data: LoginRequest): Promise<LoginResponse>;
  verifyOtp(data: VerifyEmailRequest): Promise<VerifyEmailResponse>;
  resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse>;
}
