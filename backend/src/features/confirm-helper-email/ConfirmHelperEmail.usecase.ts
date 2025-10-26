import { AuthUserToHelperMapper } from "@infrastructure/persistence/mappers/AuthUserToHelperMapper";
import { Helper } from "@shared/domain/entities/Helper";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService";
import { Result } from "@shared/infrastructure/Result";
import { ConfirmHelperEmailCommand } from "./ConfirmHelperEmail.command";

export class ConfirmHelperEmail {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly authUserRepository: AuthUserRepository,
    private readonly helperRepository: HelperRepository
  ) {}

  async execute({
    email,
    token,
  }: ConfirmHelperEmailCommand): Promise<Result<void, Error>> {
    const authUser = await this.authUserRepository.getUserByEmail(email);

    if (!authUser) {
      return Result.fail(new Error("Account not found"));
    }

    const isIncomplete =
      authUser.professions.some((p) => !p.credentialId) ||
      !authUser.criminalRecordCertificateId;

    const helperPropsResult = AuthUserToHelperMapper.toHelperProps(authUser);
    if (Result.isFailure(helperPropsResult)) {
      console.error(
        "Failed to map AuthUser to HelperProps:",
        helperPropsResult.error
      );
      return Result.fail(
        new Error("System error - unable to process account data")
      );
    }

    const helper = isIncomplete
      ? Helper.asIncomplete(helperPropsResult.value)
      : Helper.inPendingReview(helperPropsResult.value);

    const saveResult = await this.helperRepository.save(helper);

    if (Result.isFailure(saveResult)) {
      return Result.fail(saveResult.error);
    }

    await this.authUserRepository.confirmEmail(email);

    return Result.ok();
  }
}
