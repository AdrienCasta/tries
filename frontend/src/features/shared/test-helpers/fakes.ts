import type {
  SignupRequest,
  SignupResponse,
} from "@/features/signup/Signup.types";
import type { AuthService } from "../api/types";
import type {
  ResendOtpRequest,
  ResendOtpResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/features/email-verification/EmailVerification.types";
import type { LoginRequest, LoginResponse } from "@/features/login/Login.types";

export class FakeSuccessAuthService implements AuthService {
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
      user: {
        id: "123456",
        email: "adrie@castagliola@example.com",
        firstname: "Adrien",
        lastname: "Castagliola",
      },
    };
  }
  async resendOtp(_data: ResendOtpRequest): Promise<ResendOtpResponse> {
    return {
      success: true,
      message: "Un code vous a été envoyé par email",
    };
  }
  async login(_data: LoginRequest): Promise<LoginResponse> {
    return {
      success: true,
      message: "Connecté",
    };
  }

  private async delay() {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export class FakeFailureAuthService implements AuthService {
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
  async login(_data: LoginRequest): Promise<LoginResponse> {
    return {
      success: false,
      message: "L'authentification a échoué",
    };
  }
}

/**
 * @deprecated use slow propery FakeSuccessAuthRepository
 * ex: 
 *  const repository = new FakeSuccessAuthRepository();
    repository.slow = true;
 */
export class FakeSlowAuthRepository implements AuthService {
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
