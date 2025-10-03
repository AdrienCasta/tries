import { HelperRepository } from "../../domain/repositories/HelperRepository.js";
import Password from "../../domain/value-objects/Password.js";
import { Result } from "../../shared/Result.js";
import ValidationError from "../../domain/errors/ValidationError.js";
import PasswordSetupError from "../../domain/errors/PasswordSetupError.js";

export class SetupHelperPassword {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute(
    token: string,
    plainPassword: string
  ): Promise<Result<void, ValidationError | PasswordSetupError>> {
    const helper = await this.helperRepository.findByPasswordSetupToken(token);

    if (!helper) {
      return Result.fail(PasswordSetupError.tokenInvalid());
    }

    if (helper.password) {
      return Result.fail(PasswordSetupError.passwordAlreadySet());
    }

    if (helper.passwordSetupToken && helper.passwordSetupToken.isExpired()) {
      return Result.fail(PasswordSetupError.tokenExpired());
    }

    const passwordResult = await Password.create(plainPassword);
    if (Result.isFailure(passwordResult)) {
      return Result.fail(passwordResult.error);
    }

    helper.password = passwordResult.value;
    helper.passwordSetAt = new Date();
    helper.passwordSetupToken = undefined;

    await this.helperRepository.save(helper);

    return Result.ok(undefined);
  }
}
