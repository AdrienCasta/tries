import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService.js";
import { Result } from "@shared/infrastructure/Result.js";
import {
  InvalidTokenFormatError,
  TokenExpiredError,
  EmailAlreadyConfirmedError,
} from "../../ConfirmHelperEmail.errors.js";

export class FakeEmailConfirmationService implements EmailConfirmationService {
  private tokens: Set<string> = new Set();
  private expiredTokens: Set<string> = new Set();
  private confirmedTokens: Set<string> = new Set();

  registerToken(token: string): void {
    this.tokens.add(token);
  }

  markTokenAsExpired(token: string): void {
    this.expiredTokens.add(token);
  }

  markEmailAsConfirmed(token: string): void {
    this.confirmedTokens.add(token);
  }

  async confirmEmail(
    token: string
  ): Promise<
    Result<
      void,
      InvalidTokenFormatError | TokenExpiredError | EmailAlreadyConfirmedError
    >
  > {
    if (this.expiredTokens.has(token)) {
      return Result.fail(new TokenExpiredError());
    }

    if (this.confirmedTokens.has(token)) {
      return Result.fail(new EmailAlreadyConfirmedError());
    }

    return Result.ok(undefined);
  }
}
