import { User } from "../../domain/entities/User.js";
import { Helper } from "../../domain/entities/Helper.js";
import { HelperAccount } from "../../domain/entities/HelperAccount.js";
import HelperId from "../../domain/value-objects/HelperId.js";
import { HelperRepository } from "../../domain/repositories/HelperRepository.js";
import { HelperAccountRepository } from "../../domain/repositories/HelperAccountRepository.js";
import HelperEmail from "../../domain/value-objects/HelperEmail.js";
import Firstname from "../../domain/value-objects/Firstname.js";
import Lastname from "../../domain/value-objects/Lastname.js";
import { Result } from "../../shared/Result.js";
import ValidationError from "../../domain/errors/ValidationError.js";
import DuplicateHelperError from "../../domain/errors/DuplicateHelperError.js";
import { OnboardedHelperNotificationService } from "../../domain/services/OnboardingHelperNotificationService.js";
import { Clock } from "../../domain/services/Clock.js";
import Password from "../../domain/value-objects/Password.js";

export class OnboardHelper {
  constructor(
    private readonly helperRepository: HelperRepository,
    private readonly helperAccountRepository: HelperAccountRepository,
    private readonly notif: OnboardedHelperNotificationService,
    private readonly clock: Clock
  ) {}

  async execute({
    email,
    firstname,
    lastname,
  }: User): Promise<Result<HelperId, ValidationError | DuplicateHelperError>> {
    const emailResult = HelperEmail.create(email);
    if (Result.isFailure(emailResult)) {
      return Result.fail(emailResult.error);
    }

    const firstnameResult = Firstname.create(firstname);
    if (Result.isFailure(firstnameResult)) {
      return Result.fail(firstnameResult.error);
    }

    const lastnameResult = Lastname.create(lastname);
    if (Result.isFailure(lastnameResult)) {
      return Result.fail(lastnameResult.error);
    }

    const existingHelper = await this.helperRepository.findByEmail(email);
    if (existingHelper) {
      return Result.fail(DuplicateHelperError.forEmail(email));
    }

    const helperId = HelperId.generate();

    const helperAccount: HelperAccount = {
      helperId,
      password: await Password.generateTemporary(),
      email: emailResult.value,
      createdAt: this.clock.now(),
    };

    const helper: Helper = {
      id: helperId,
      email: emailResult.value,
      firstname: firstnameResult.value,
      lastname: lastnameResult.value,
    };

    const { success } = await this.helperAccountRepository.create(
      helperAccount
    );

    if (success) {
      this.notif.send({ email, firstname, lastname });
    }
    await this.helperRepository.save(helper);

    return Result.ok(helper.id);
  }
}
