import { Result } from "@shared/infrastructure/Result";
import SignupCommand from "./signup.command";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import AuthService from "@shared/domain/services/AuthService";

export type SignupResult = Result<void, Error>;

export default class Signup {
  constructor(private readonly authService: AuthService) {}

  async execute(command: SignupCommand): Promise<SignupResult> {
    const emailResult = HelperEmail.create(command.email);

    if (Result.isFailure(emailResult)) {
      return emailResult;
    }

    // const duplicateEmailCheck = await this.checkDuplicateEmail(command.email);
    // if (Result.isFailure(duplicateEmailCheck)) {
    //   return duplicateEmailCheck;
    // }

    try {
      await this.authService.signUp(command.email);

      // const profileResult = await this.userRepository.create({
      //   id: signUpResult.userId,
      //   email: command.email,
      //   firstname: command.firstname,
      //   lastname: command.lastname,
      // });

      // if (Result.isFailure(profileResult)) {
      //   return profileResult;
      // }

      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  private async checkDuplicateEmail(
    email: string
  ): Promise<Result<void, Error>> {
    const existingUser = await this.authService.existsByEmail(email);
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
