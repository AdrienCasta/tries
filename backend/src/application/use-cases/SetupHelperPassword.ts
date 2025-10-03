import { HelperAccountRepository } from "../../domain/repositories/HelperAccountRepository.js";
import Password from "../../domain/value-objects/Password.js";
import { Result } from "../../shared/Result.js";
import ValidationError from "../../domain/errors/ValidationError.js";
import PasswordSetupError from "../../domain/errors/PasswordSetupError.js";

export class SetupHelperPassword {
  constructor(
    private readonly helperAccountRepository: HelperAccountRepository
  ) {}

  async execute(
    token: string,
    plainPassword: string
  ): Promise<Result<void, ValidationError | PasswordSetupError>> {
    const helperAccount =
      await this.helperAccountRepository.findByPasswordSetupToken(token);

    if (!helperAccount) {
      return Result.fail(PasswordSetupError.tokenInvalid());
    }

    if (helperAccount.password) {
      return Result.fail(PasswordSetupError.passwordAlreadySet());
    }

    if (
      helperAccount.passwordSetupToken &&
      helperAccount.passwordSetupToken.isExpired()
    ) {
      return Result.fail(PasswordSetupError.tokenExpired());
    }

    const passwordResult = await Password.create(plainPassword);
    if (Result.isFailure(passwordResult)) {
      return Result.fail(passwordResult.error);
    }

    helperAccount.password = passwordResult.value;
    helperAccount.passwordSetAt = new Date();
    helperAccount.passwordSetupToken = undefined;

    await this.helperAccountRepository.save(helperAccount);

    return Result.ok(undefined);
  }
}
