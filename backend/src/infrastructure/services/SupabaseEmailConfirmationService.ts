import { SupabaseClient } from "@supabase/supabase-js";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService.js";
import { Result } from "@shared/infrastructure/Result.js";
import {
  InvalidTokenFormatError,
  TokenExpiredError,
  EmailAlreadyConfirmedError,
} from "../../features/confirm-helper-email/ConfirmHelperEmail.errors.js";

export class SupabaseEmailConfirmationService
  implements EmailConfirmationService
{
  constructor(private readonly supabase: SupabaseClient) {}

  async confirmEmail(
    token: string
  ): Promise<
    Result<
      void,
      InvalidTokenFormatError | TokenExpiredError | EmailAlreadyConfirmedError
    >
  > {
    const { data, error } = await this.supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      if (error.message.includes("expired")) {
        return Result.fail(new TokenExpiredError());
      }
      if (error.message.includes("already confirmed")) {
        return Result.fail(new EmailAlreadyConfirmedError());
      }
      return Result.fail(new InvalidTokenFormatError());
    }

    return Result.ok(undefined);
  }
}
