import { OnboardHelperCommand } from "./OnboardHelper.command.js";
import { Helper as Helper } from "@shared/domain/entities/Helper.js";
import { HelperAccount } from "@shared/domain/entities/HelperAccount.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import { HelperAccountRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import Firstname, {
  FirstnameEmptyError,
  FirstnameTooShortError,
} from "@shared/domain/value-objects/Firstname.js";
import Lastname, {
  LastnameEmptyError,
  LastnameTooShortError,
} from "@shared/domain/value-objects/Lastname.js";
import PhoneNumber, {
  PhoneNumberError,
} from "@shared/domain/value-objects/PhoneNumber.js";
import Profession, {
  ProfessionError,
} from "@shared/domain/value-objects/Profession.js";
import FrenchCounty, {
  FrenchCountyError,
} from "@shared/domain/value-objects/FrenchCounty.js";
import { OnboardedHelperNotificationService } from "@shared/domain/services/OnboardingHelperNotificationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import Password from "@shared/domain/value-objects/Password.js";
import CreateHelperAccountException from "@shared/infrastructure/CreateHelperAccountException.js";
import Birthdate, {
  BirthdateInFuturError,
  TooYoungToWorkError,
} from "@shared/domain/value-objects/Birthdate.js";
import { Result } from "@shared/infrastructure/Result.js";
import InvalidEmailError from "@shared/infrastructure/InvalidEmailError.js";

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
    professions,
    birthdate,
    frenchCounty,
  }: OnboardHelperCommand): Promise<
    Result<
      HelperId,
      | InvalidEmailError
      | BirthdateInFuturError
      | PhoneNumberError
      | TooYoungToWorkError
      | FirstnameEmptyError
      | FirstnameTooShortError
      | LastnameTooShortError
      | LastnameEmptyError
      | ProfessionError
      | FrenchCountyError
      | EmailAlreadyUsedError
      | CreateHelperAccountException
    >
  > {
    const validated = Result.combineObject({
      email: HelperEmail.create(email),
      firstname: Firstname.create(firstname),
      lastname: Lastname.create(lastname),
      phoneNumber: PhoneNumber.create(phoneNumber),
      birthdate: Birthdate.create(birthdate, { clock: this.clock }),
      professions: Profession.createMany(professions),
      frenchCounty: FrenchCounty.create(frenchCounty),
    });

    if (Result.isFailure(validated)) {
      return Result.fail(validated.error);
    }

    const existingHelper = await this.helperRepository.findByEmail(
      validated.value.email.toValue()
    );
    if (existingHelper) {
      return Result.fail(
        new EmailAlreadyUsedError(validated.value.email.toValue())
      );
    }

    const helperId = HelperId.generate();

    const helperAccount: HelperAccount = {
      helperId,
      password: await Password.generateTemporary(),
      email: validated.value.email,
      createdAt: this.clock.now(),
      phoneNumber: validated.value.phoneNumber,
    };

    const accountResult = await this.helperAccountRepository.create(
      helperAccount
    );

    if (Result.isFailure(accountResult)) {
      return Result.fail(accountResult.error);
    }

    const helper: Helper = {
      id: helperId,
      email: validated.value.email,
      firstname: validated.value.firstname,
      lastname: validated.value.lastname,
      birthdate: validated.value.birthdate,
      professions: validated.value.professions,
      frenchCounty: validated.value.frenchCounty,
    };

    await this.helperRepository.save(helper);
    this.notif.send({ email, firstname, lastname, phoneNumber, professions });

    return Result.ok(helper.id);
  }
}

class EmailAlreadyUsedError extends Error {
  readonly code = "EMAIL_ALREADY_IN_USE";
  constructor(email: string) {
    super();
  }
}

export type OnboardHelperResult = ReturnType<
  typeof OnboardHelper.prototype.execute
>;
