import { OnboardHelperCommand } from "./OnboardHelper.command.js";
import { Helper } from "@shared/domain/entities/Helper.js";
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
import EmailAlreadyUsedError from "@shared/infrastructure/EmailAlreadyUsedError.js";
import PhoneAlreadyUsedError from "@shared/infrastructure/PhoneAlreadyUsedError.js";

type ValidationError =
  | InvalidEmailError
  | BirthdateInFuturError
  | PhoneNumberError
  | TooYoungToWorkError
  | FirstnameEmptyError
  | FirstnameTooShortError
  | LastnameTooShortError
  | LastnameEmptyError
  | ProfessionError
  | FrenchCountyError;

type OnboardHelperError =
  | ValidationError
  | EmailAlreadyUsedError
  | PhoneAlreadyUsedError
  | CreateHelperAccountException;

export class OnboardHelper {
  constructor(
    private readonly helperRepository: HelperRepository,
    private readonly helperAccountRepository: HelperAccountRepository,
    private readonly notif: OnboardedHelperNotificationService,
    private readonly clock: Clock
  ) {}

  async execute(
    command: OnboardHelperCommand
  ): Promise<Result<HelperId, OnboardHelperError>> {
    const validated = this.validateCommand(command);

    if (Result.isFailure(validated)) {
      return Result.fail(validated.error);
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

    this.notif.send({
      email: validated.value.email.value,
      firstname: validated.value.firstname.value,
      lastname: validated.value.lastname.value,
      phoneNumber: validated.value.phoneNumber.value,
      professions: validated.value.professions.map((p) => p.value),
    });

    return Result.ok(helper.id);
  }

  private validateCommand(command: OnboardHelperCommand) {
    return Result.combineObject({
      email: HelperEmail.create(command.email),
      firstname: Firstname.create(command.firstname),
      lastname: Lastname.create(command.lastname),
      phoneNumber: PhoneNumber.create(command.phoneNumber),
      birthdate: Birthdate.create(command.birthdate, { clock: this.clock }),
      professions: Profession.createMany(command.professions),
      frenchCounty: FrenchCounty.create(command.frenchCounty),
    });
  }
}

export type OnboardHelperResult = ReturnType<
  typeof OnboardHelper.prototype.execute
>;
