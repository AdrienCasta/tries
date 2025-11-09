import type { ProfileCompletionCommand } from "./ProfileCompletion.schema";
import type { ProfileCompletionResponse } from "./ProfileCompletion.types";

export class ProfileService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000/api/profile") {
    this.baseUrl = baseUrl;
  }

  async completeProfile(
    userId: string,
    data: ProfileCompletionCommand
  ): Promise<ProfileCompletionResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          firstname: data.firstname,
          lastname: data.lastname,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || "Failed to update profile",
        };
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || "Profile updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }
}
