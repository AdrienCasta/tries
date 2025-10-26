import { SupabaseClient } from "@supabase/supabase-js";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService.js";
import { Result } from "@shared/infrastructure/Result.js";

export class SupabaseEmailConfirmationService
  implements EmailConfirmationService
{
  constructor(private readonly supabase: SupabaseClient) {}

  async confirmEmail(token: string): Promise<Result<void, Error>> {
    if (!token) {
      return Result.fail(new Error("Token is required"));
    }

    const { data, error } = await this.supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      return Result.fail(new Error(error.message));
    }

    return Result.ok(undefined);
  }
}
