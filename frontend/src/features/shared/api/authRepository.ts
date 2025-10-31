import type { IAuthRepository, SignupResult } from "./types";
import type SignupCommand from "../../signup/Signup.types";

export class AuthRepository implements IAuthRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/auth") {
    this.baseUrl = baseUrl;
  }

  async signup(data: SignupCommand): Promise<SignupResult> {
    try {
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || "Failed to sign up",
        };
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "User signed up successfully",
      };
    } catch (error) {
      console.error("Error signing up:", error);
      return {
        success: false,
        error: "System unavailable. Please try again.",
      };
    }
  }
}
