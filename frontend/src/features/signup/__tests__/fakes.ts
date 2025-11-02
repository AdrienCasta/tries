import type { AuthService } from "@/features/shared/api/types";
import type { SignupRequest, SignupResponse } from "../Signup.types";

export class FakeSuccessSignup implements Pick<AuthService, "signup"> {
  async signup(_data: SignupRequest): Promise<SignupResponse> {
    return {
      success: true,
      message: "User signed up successfully",
    };
  }
}

export class FakeFailureSignup implements Pick<AuthService, "signup"> {
  async signup(_data: SignupRequest): Promise<SignupResponse> {
    return {
      success: false,
      error: "Failed to sign up",
    };
  }
}

export class FakeSlowSignup implements Pick<AuthService, "signup"> {
  async signup(_data: SignupRequest): Promise<SignupResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "User signed up successfully",
    };
  }
}
