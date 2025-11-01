import { Result } from "@shared/infrastructure/Result";
import ResendOtpCommand from "./resend-otp.command";
import AuthUserRepository, {
  UserNotFoundError,
  SendOtpError,
} from "@shared/domain/repositories/AuthUserRepository";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";

export type ResendOtpResult = Result<void, Error>;

export default class ResendOtp {
  constructor(private readonly authUserRepository: AuthUserRepository) {}

  async execute(command: ResendOtpCommand): Promise<ResendOtpResult> {
    const emailValidation = HelperEmail.create(command.email);

    if (Result.isFailure(emailValidation)) {
      return emailValidation;
    }

    const sendResult = await this.authUserRepository.sendOtp(command.email);

    if (Result.isFailure(sendResult)) {
      return sendResult;
    }

    return Result.ok();
  }
}
