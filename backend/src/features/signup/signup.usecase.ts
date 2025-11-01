import { Result } from "@shared/infrastructure/Result";
import SignupCommand from "./signup.command";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import Password from "@shared/domain/value-objects/Password";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository";

export type SignupResult = Result<void, Error>;

export default class Signup {
  constructor(private readonly authUserRepository: AuthUserRepository) {}

  async execute(command: SignupCommand): Promise<SignupResult> {
    const guard = Result.combineObject({
      email: HelperEmail.create(command.email),
      password: Password.create(command.password),
    });

    if (Result.isFailure(guard)) {
      return guard;
    }

    const duplicateEmailCheck = await this.checkDuplicateEmail(command.email);
    if (Result.isFailure(duplicateEmailCheck)) {
      return duplicateEmailCheck;
    }

    try {
      await this.authUserRepository.createUser({
        email: command.email,
        password: command.password,
      });

      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private async checkDuplicateEmail(
    email: string
  ): Promise<Result<void, Error>> {
    const existingUser = await this.authUserRepository.existsByEmail(email);
    if (existingUser) {
      return Result.fail(new EmailAlreadyInUseError());
    }
    return Result.ok();
  }
}

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super("this email address is already in use.");
    this.name = "EmailAlreadyInUseError";
  }
}
