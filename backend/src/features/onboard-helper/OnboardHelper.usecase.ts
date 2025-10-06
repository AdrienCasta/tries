import { User } from "@shared/types/User.js";
import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperAccount } from "@shared/domain/entities/HelperAccount.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import { HelperAccountRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import Firstname from "@shared/domain/value-objects/Firstname.js";
import Lastname from "@shared/domain/value-objects/Lastname.js";
import PhoneNumber from "@shared/domain/value-objects/PhoneNumber.js";
import { Result } from "@shared/infrastructure/Result.js";
import { ValidationError } from "./OnboardHelper.errors.js";
import { DuplicateHelperError } from "./OnboardHelper.errors.js";
import { OnboardedHelperNotificationService } from "@shared/domain/services/OnboardingHelperNotificationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import Password from "@shared/domain/value-objects/Password.js";
import { InvalidEmailError } from "./OnboardHelper.errors.js";
import CreateHelperAccountException from "@shared/infrastructure/CreateHelperAccountException.js";

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
    phoneNumber,
  }: User): Promise<
    Result<
      HelperId,
      | InvalidEmailError
      | ValidationError
      | DuplicateHelperError
      | CreateHelperAccountException
    >
  > {
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

    const phoneNumberResult = PhoneNumber.create(phoneNumber);
    if (Result.isFailure(phoneNumberResult)) {
      return Result.fail(phoneNumberResult.error);
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
      phoneNumber: phoneNumberResult.value,
    };

    const accountResult = await this.helperAccountRepository.create(
      helperAccount
    );

    const helper: Helper = {
      id: helperId,
      email: emailResult.value,
      firstname: firstnameResult.value,
      lastname: lastnameResult.value,
    };

    if (Result.isFailure(accountResult)) {
      return Result.fail(accountResult.error);
    }

    await this.helperRepository.save(helper);
    this.notif.send({ email, firstname, lastname, phoneNumber });

    return Result.ok(helper.id);
  }
}
