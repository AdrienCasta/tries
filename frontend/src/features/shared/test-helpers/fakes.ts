import type { SignupResponse } from "@/features/signup/Signup.types";
import type { AuthService } from "../api/types";
import type {
  ResendOtpResponse,
  VerifyEmailResponse,
} from "@/features/email-verification/EmailVerification.types";
import type { LoginResponse } from "@/features/login/Login.types";

export class FakeSuccessAuthService implements AuthService {
  slow = false;
  async signup(): Promise<SignupResponse> {
    return {
      success: true,
      message: "User signed up successfully",
    };
  }
  async verifyOtp(): Promise<VerifyEmailResponse> {
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
  async resendOtp(): Promise<ResendOtpResponse> {
    return {
      success: true,
      message: "Un code vous a été envoyé par email",
    };
  }
  async login(): Promise<LoginResponse> {
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
  async signup(): Promise<SignupResponse> {
    return {
      success: false,
      error: "Failed to sign up",
    };
  }
  async verifyOtp(): Promise<VerifyEmailResponse> {
    return {
      success: false,
      message: "La vérification à échoué",
    };
  }
  async resendOtp(): Promise<ResendOtpResponse> {
    return {
      success: false,
      message: "L'envoie du code de vérification à échoué",
    };
  }
  async login(): Promise<LoginResponse> {
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
  async signup(): Promise<SignupResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "User signed up successfully",
    };
  }
  async verifyOtp(): Promise<VerifyEmailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "Your email is verified",
    };
  }
  async resendOtp(): Promise<ResendOtpResponse> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: "Un code vous a été envoyé par email",
    };
  }
}
