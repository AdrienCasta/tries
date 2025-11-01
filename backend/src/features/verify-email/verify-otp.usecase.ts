import { Result } from "@shared/infrastructure/Result";
import VerifyOtpCommand from "./verify-otp.command";
import AuthUserRepository, {
  OtpVerificationError,
} from "@shared/domain/repositories/AuthUserRepository";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import OtpCode from "@shared/domain/value-objects/OtpCode";

export type VerifyOtpResult = Result<void, Error>;

export default class VerifyOtp {
  constructor(private readonly authUserRepository: AuthUserRepository) {}

  async execute(command: VerifyOtpCommand): Promise<VerifyOtpResult> {
    const guard = Result.combineObject({
      email: HelperEmail.create(command.email),
      otpCode: OtpCode.create(command.otpCode),
    });

    if (Result.isFailure(guard)) {
      return guard;
    }

    const verificationResult = await this.authUserRepository.verifyOtp(
      command.email,
      command.otpCode
    );

    if (Result.isFailure(verificationResult)) {
      return verificationResult;
    }

    return Result.ok();
  }
}
