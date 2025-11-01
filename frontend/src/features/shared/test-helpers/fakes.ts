import type {
  SignupRequest,
  SignupResponse,
} from "@/features/signup/Signup.types";
import type { IAuthRepository } from "../api/types";
import type {
  ResendOtpRequest,
  ResendOtpResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/features/email-verification/EmailVerification.types";

export class FakeSuccessAuthRepository implements IAuthRepository {
  slow = false;
  async signup(_data: SignupRequest): Promise<SignupResponse> {
    return {
      success: true,
      message: "User signed up successfully",
    };
  }
  async verifyOtp(_data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    if (this.slow) {
      this.delay();
    }
    return {
      success: true,
      message: "Your email is verified",
    };
  }
  async resendOtp(_data: ResendOtpRequest): Promise<ResendOtpResponse> {
    return {
      success: true,
      message: "Un code vous a été envoyé par email",
    };
  }

  private async delay() {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export class FakeFailureAuthRepository implements IAuthRepository {
  async signup(_data: SignupRequest): Promise<SignupResponse> {
    return {
      success: false,
      error: "Failed to sign up",
    };
  }
  async verifyOtp(_data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return {
      success: false,
      message: "La vérification à échoué",
    };
  }
  async resendOtp(_data: ResendOtpRequest): Promise<ResendOtpResponse> {
    return {
      success: false,
      message: "L'envoie du code de vérification à échoué",
    };
  }
}

/**
 * @deprecated use slow propery FakeSuccessAuthRepository
 * ex: 
 *  const repository = new FakeSuccessAuthRepository();
    repository.slow = true;
 */
export class FakeSlowAuthRepository implements IAuthRepository {
  async signup(_data: SignupRequest): Promise<SignupResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "User signed up successfully",
    };
  }
  async verifyOtp(_data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "Your email is verified",
    };
  }
  async resendOtp(_data: ResendOtpRequest): Promise<ResendOtpResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "Un code vous a été envoyé par email",
    };
  }
}
