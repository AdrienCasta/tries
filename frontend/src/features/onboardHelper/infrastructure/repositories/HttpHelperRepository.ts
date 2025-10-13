import type { IHelperRepository, OnboardHelperResult } from "../../domain/interfaces/IHelperRepository";
import type { OnboardHelperCommand } from "../../types/OnboardHelperForm.types";

export class HttpHelperRepository implements IHelperRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "/api/helpers") {
    this.baseUrl = baseUrl;
  }

  async onboard(data: OnboardHelperCommand): Promise<OnboardHelperResult> {
    try {
      const response = await fetch(`${this.baseUrl}/onboard`, {
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
          error: errorData.error || "Failed to onboard helper",
        };
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "Helper onboarded successfully",
      };
    } catch (error) {
      console.error("Error onboarding helper:", error);
      return {
        success: false,
        error: "System unavailable. Please try again.",
      };
    }
  }
}
