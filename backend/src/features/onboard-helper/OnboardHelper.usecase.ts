import { User } from "@shared/types/User.js";
import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperAccount } from "@shared/domain/entities/HelperAccount.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import { HelperAccountRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import { ProfessionRepository } from "@shared/domain/repositories/ProfessionRepository.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import Firstname from "@shared/domain/value-objects/Firstname.js";
import Lastname from "@shared/domain/value-objects/Lastname.js";
import PhoneNumber from "@shared/domain/value-objects/PhoneNumber.js";
import Profession from "@shared/domain/value-objects/Profession.js";
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
    private readonly professionRepository: ProfessionRepository,
    private readonly notif: OnboardedHelperNotificationService,
    private readonly clock: Clock
  ) {}

  async execute({
    email,
    firstname,
    lastname,
    phoneNumber,
    professions,
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

    // Validate professions array
    const professionsResult = Profession.createMany(professions);
    if (Result.isFailure(professionsResult)) {
      return Result.fail(professionsResult.error);
    }

    // Validate professions against database
    if (professionsResult.value.length > 0) {
      const validProfessions = await this.professionRepository.findAll();
      const validationResult = Profession.validateAgainstList(
        professionsResult.value,
        validProfessions
      );
      if (Result.isFailure(validationResult)) {
        return Result.fail(validationResult.error);
      }
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
      professions: professionsResult.value,
    };

    if (Result.isFailure(accountResult)) {
      return Result.fail(accountResult.error);
    }

    await this.helperRepository.save(helper);
    this.notif.send({ email, firstname, lastname, phoneNumber, professions });

    return Result.ok(helper.id);
  }
}
