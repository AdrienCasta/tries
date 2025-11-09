import { Result } from "@shared/infrastructure/Result";
import VerifyOtpCommand from "./verify-otp.command";
import AuthService from "@shared/domain/services/AuthService";
import { AuthUserRead } from "@shared/domain/entities/AuthUser";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import OtpCode from "@shared/domain/value-objects/OtpCode";
import UserRepository from "@shared/domain/repositories/UserRepository";
import { ProfileStatus } from "@shared/domain/entities/User";

export interface VerifyOtpResultData extends AuthUserRead {
  profileStatus: ProfileStatus;
}

export type VerifyOtpResult = Result<VerifyOtpResultData, Error>;

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

    const authUser = verificationResult.value;

    let userProfile = await this.userRepository.findById(authUser.id);

    if (!userProfile) {
      const createResult = await this.userRepository.create({
        id: authUser.id,
        email: authUser.email,
        profileStatus: "incomplete",
      });

      if (Result.isFailure(createResult)) {
        return createResult;
      }

      userProfile = await this.userRepository.findById(authUser.id);

      if (!userProfile) {
        return Result.fail(new Error("Failed to create user profile"));
      }
    }

    return Result.ok({
      ...authUser,
      profileStatus: userProfile.profileStatus ?? "incomplete",
    });
  }
}
