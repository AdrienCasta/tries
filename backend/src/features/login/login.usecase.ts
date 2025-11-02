import { Result } from "@shared/infrastructure/Result";
import LoginCommand from "./login.command";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import AuthService, { UserNotFoundError, SendOtpError } from "@shared/domain/services/AuthService";

export type LoginResult = Result<void, Error>;

export default class Login {
  constructor(private readonly authService: AuthService) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const emailValidation = HelperEmail.create(command.email);

    if (Result.isFailure(emailValidation)) {
      return emailValidation;
    }

    const sendOtpResult = await this.authService.signInWithOtp(command.email);

    if (Result.isFailure(sendOtpResult)) {
      return sendOtpResult;
    }

    return Result.ok();
  }
}
