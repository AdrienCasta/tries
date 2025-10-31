import type { OnboardHelperCommand } from "../../register-helper/RegisterHelper.types";
import type SignupCommand from "../../signup/Signup.types";

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
}
