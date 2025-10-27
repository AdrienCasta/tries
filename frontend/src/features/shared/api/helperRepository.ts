import type { IHelperRepository, OnboardHelperResult } from "./types";
import type { OnboardHelperCommand } from "../../onboard-helper/OnboardHelper.types";

export class HttpHelperRepository implements IHelperRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000/api/helpers") {
    this.baseUrl = baseUrl;
  }

  async onboard(data: OnboardHelperCommand): Promise<OnboardHelperResult> {
    try {
      const backendRequest = this.mapToBackendRequest(data);

      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendRequest),
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

  private mapToBackendRequest(data: OnboardHelperCommand) {
    return {
      email: data.email,
      password: data.password,
      firstname: data.firstname,
      lastname: data.lastname,
      phoneNumber: data.phoneNumber,
      birthdate: data.birthdate,
      placeOfBirth: {
        country: data.placeOfBirth.country,
        city: data.placeOfBirth.city || "",
      },
      professions: Object.keys(data.rppsNumbers).map((professionCode) => ({
        code: professionCode,
        healthId: { rpps: data.rppsNumbers[professionCode] },
      })),
      residence: {
        country: data.countryOfResidence,
        ...(data.frenchAreaCode ? { frenchAreaCode: data.frenchAreaCode } : {}),
      },
    };
  }
}
