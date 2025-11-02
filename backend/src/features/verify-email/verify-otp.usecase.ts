import { Result } from "@shared/infrastructure/Result";
import VerifyOtpCommand from "./verify-otp.command";
import AuthService, {
  OtpVerificationError,
} from "@shared/domain/services/AuthService";
import UserRepository from "@shared/domain/repositories/UserRepository";
import { UserProps } from "@shared/domain/entities/User";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import OtpCode from "@shared/domain/value-objects/OtpCode";

export type VerifyOtpResult = Result<UserProps, Error>;

export default class VerifyOtp {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository
  ) {}

  async execute(command: VerifyOtpCommand): Promise<VerifyOtpResult> {
    const guard = Result.combineObject({
      email: HelperEmail.create(command.email),
      otpCode: OtpCode.create(command.otpCode),
    });

    if (Result.isFailure(guard)) {
      return guard;
    }

    const verificationResult = await this.authService.verifyOtp(
      command.email,
      command.otpCode
    );

    if (Result.isFailure(verificationResult)) {
      return verificationResult;
    }

    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      return Result.fail(new Error("User not found after verification"));
    }

    return Result.ok(user);
  }
}
