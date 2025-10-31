import type { IHelperRepository, OnboardHelperResult, IAuthRepository, SignupResult } from "../api/types";
import type { OnboardHelperCommand } from "../../register-helper/RegisterHelper.types";
import type SignupCommand from "../../signup/Signup.types";

export class FakeSuccessRepository implements IHelperRepository {
  async onboard(_data: OnboardHelperCommand): Promise<OnboardHelperResult> {
    return {
      success: true,
      message: "Helper onboarded successfully",
    };
  }
}

export class FakeFailureRepository implements IHelperRepository {
  async onboard(_data: OnboardHelperCommand): Promise<OnboardHelperResult> {
    return {
      success: false,
      error: "Failed to onboard helper",
    };
  }
}

export class FakeSlowRepository implements IHelperRepository {
  async onboard(_data: OnboardHelperCommand): Promise<OnboardHelperResult> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "Helper onboarded successfully",
    };
  }
}

export class FakeSuccessAuthRepository implements IAuthRepository {
  async signup(_data: SignupCommand): Promise<SignupResult> {
    return {
      success: true,
      message: "User signed up successfully",
    };
  }
}

export class FakeFailureAuthRepository implements IAuthRepository {
  async signup(_data: SignupCommand): Promise<SignupResult> {
    return {
      success: false,
      error: "Failed to sign up",
    };
  }
}

export class FakeSlowAuthRepository implements IAuthRepository {
  async signup(_data: SignupCommand): Promise<SignupResult> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "User signed up successfully",
    };
  }
}
