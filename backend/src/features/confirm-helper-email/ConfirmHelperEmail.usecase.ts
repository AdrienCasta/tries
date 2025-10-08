import { ConfirmHelperEmailCommand } from "./ConfirmHelperEmail.command.js";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import { Result } from "@shared/infrastructure/Result.js";
import {
  InvalidTokenFormatError,
  TokenExpiredError,
  EmailAlreadyConfirmedError,
} from "./ConfirmHelperEmail.errors.js";

export class ConfirmHelperEmail {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly clock: Clock
  ) {}

  async execute({
    token,
  }: ConfirmHelperEmailCommand): Promise<
    Result<
      void,
      InvalidTokenFormatError | TokenExpiredError | EmailAlreadyConfirmedError
    >
  > {
    if (!this.isValidTokenFormat(token)) {
      return Result.fail(new InvalidTokenFormatError());
    }

    const confirmationResult = await this.emailConfirmationService.confirmEmail(
      token
    );

    if (Result.isFailure(confirmationResult)) {
      return Result.fail(confirmationResult.error);
    }

    return Result.ok(undefined);
  }

  private isValidTokenFormat(token: string): boolean {
    if (!token || token.trim().length === 0) {
      return false;
    }
    if (token.length < 10) {
      return false;
    }
    return true;
  }
}

export type ConfirmHelperEmailResult = ReturnType<
  typeof ConfirmHelperEmail.prototype.execute
>;
