import { OnboardHelperCommand } from "./OnboardHelper.command.js";
import { Helper } from "@shared/domain/entities/Helper.js";
import { AuthUser } from "@shared/domain/entities/AuthUser.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import { AuthRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
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
import Residence, {
  ResidenceError,
} from "@shared/domain/value-objects/Residence.js";
import { OnboardedHelperNotificationService } from "@shared/domain/services/OnboardingHelperNotificationService.js";
import { Clock } from "@shared/domain/services/Clock.js";
import Password from "@shared/domain/value-objects/Password.js";
import InviteAuthUserException from "@shared/infrastructure/InviteAuthUserException.js";
import Birthdate, {
  BirthdateInFuturError,
  TooYoungToWorkError,
} from "@shared/domain/value-objects/Birthdate.js";
import { Result } from "@shared/infrastructure/Result.js";
import InvalidEmailError from "@shared/infrastructure/InvalidEmailError.js";
import EmailAlreadyUsedError from "@shared/infrastructure/EmailAlreadyUsedError.js";
import PhoneAlreadyUsedError from "@shared/infrastructure/PhoneAlreadyUsedError.js";
import SaveHelperError from "@shared/infrastructure/SaveHelperError.js";
import PlaceOfBirth, {
  PlaceOfBirthError,
} from "@shared/domain/value-objects/PlaceOfBirth.js";

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
  | PlaceOfBirthError
  | ResidenceError;

type OnboardHelperError =
  | ValidationError
  | EmailAlreadyUsedError
  | PhoneAlreadyUsedError
  | InviteAuthUserException
  | SaveHelperError;

export class OnboardHelper {
  constructor(
    private readonly helperRepository: HelperRepository,
    private readonly helperAccountRepository: AuthRepository,
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

    const invitationData: AuthUser = {
      helperId,
      password: await Password.generateTemporary(),
      email: validated.value.email,
      createdAt: this.clock.now(),
      phoneNumber: validated.value.phoneNumber,
    };

    const accountResult = await this.helperAccountRepository.inviteUser(
      invitationData
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
      residence: validated.value.residence,
      placeOfBirth: validated.value.placeOfBirth,
    };

    const saveResult = await this.helperRepository.save(helper);

    if (Result.isFailure(saveResult)) {
      await this.helperAccountRepository.delete(helperId);
      return Result.fail(saveResult.error);
    }

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
    // Validate: foreign countries cannot have french county
    if (
      command.residence.country !== "FR" &&
      command.residence.frenchCounty
    ) {
      return Result.combineObject({
        email: HelperEmail.create(command.email),
        firstname: Firstname.create(command.firstname),
        lastname: Lastname.create(command.lastname),
        phoneNumber: PhoneNumber.create(command.phoneNumber),
        birthdate: Birthdate.create(command.birthdate, { clock: this.clock }),
        professions: Profession.createMany(command.professions),
        residence: Result.fail(
          new ResidenceError(
            command.residence.country,
            command.residence.frenchCounty,
            "French county not applicable for non-French countries"
          )
        ),
        placeOfBirth: PlaceOfBirth.create(command.placeOfBirth),
      });
    }

    const residence =
      command.residence.country === "FR"
        ? Residence.createFrenchResidence(
            command.residence.frenchCounty
          )
        : Residence.createForeignResidence(
            command.residence.country
          );

    return Result.combineObject({
      email: HelperEmail.create(command.email),
      firstname: Firstname.create(command.firstname),
      lastname: Lastname.create(command.lastname),
      phoneNumber: PhoneNumber.create(command.phoneNumber),
      birthdate: Birthdate.create(command.birthdate, { clock: this.clock }),
      professions: Profession.createMany(command.professions),
      residence,
      placeOfBirth: PlaceOfBirth.create(command.placeOfBirth),
    });
  }
}

export type OnboardHelperResult = ReturnType<
  typeof OnboardHelper.prototype.execute
>;
