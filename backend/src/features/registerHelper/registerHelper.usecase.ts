import { Result } from "@shared/infrastructure/Result";
import RegisterHelperCommand from "./registerHelper.command";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import Firstname from "@shared/domain/value-objects/Firstname";
import Lastname from "@shared/domain/value-objects/Lastname";
import PhoneNumber from "@shared/domain/value-objects/PhoneNumber";
import Birthdate from "@shared/domain/value-objects/Birthdate";
import PlaceOfBirth from "@shared/domain/value-objects/PlaceOfBirth";
import Profession from "@shared/domain/value-objects/Profession";
import Residence from "@shared/domain/value-objects/Residence";
import CriminalRecordCertificate from "@shared/domain/value-objects/CriminalRecordCertificate";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository";
import { Clock } from "@shared/domain/services/Clock";
import Password from "@shared/domain/value-objects/Password";
import crypto from "node:crypto";

export default class RegisterHelper {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly clock: Clock
  ) {}

  async execute(command: RegisterHelperCommand): Promise<Result<void, Error>> {
    const guard = Result.combineObject({
      email: HelperEmail.create(command.email),
      password: Password.create(command.password),
      firstname: Firstname.create(command.firstname),
      lastname: Lastname.create(command.lastname),
      phoneNumber: PhoneNumber.create(command.phoneNumber),
      birthdate: Birthdate.create(command.birthdate, { clock: this.clock }),
      placeOfBirth: PlaceOfBirth.create(command.placeOfBirth),
      professions: Profession.createMany(command.professions as any),
      residence:
        command.residence.country === "FR"
          ? Residence.createFrenchResidence(
              command.residence.frenchAreaCode as string
            )
          : Residence.createForeignResidence(command.residence.country),
      ...(command.criminalRecordCertificate
        ? {
            criminalRecordCertificate: CriminalRecordCertificate.create(
              command.criminalRecordCertificate
            ),
          }
        : {}),
    });

    if (Result.isFailure(guard)) {
      return guard;
    }

    const duplicateEmailCheck = await this.checkDuplicateEmail(command.email);
    if (Result.isFailure(duplicateEmailCheck)) {
      return duplicateEmailCheck;
    }

    const duplicatePhoneCheck = await this.checkDuplicatePhoneNumber(
      command.phoneNumber
    );
    if (Result.isFailure(duplicatePhoneCheck)) {
      return duplicatePhoneCheck;
    }

    const professionsWithCredentialIds = command.professions.map(
      (profession) => ({
        code: profession.code,
        healthId: profession.healthId,
        ...(profession.credential
          ? { credentialId: crypto.randomUUID() }
          : {}),
      })
    );

    const criminalRecordCertificateId = command.criminalRecordCertificate
      ? crypto.randomUUID()
      : undefined;

    try {
      await this.authUserRepository.createUser({
        ...command,
        professions: professionsWithCredentialIds,
        ...(criminalRecordCertificateId
          ? { criminalRecordCertificateId }
          : {}),
      });
    } catch (error) {}
    return Result.ok(undefined);
  }

  private async checkDuplicateEmail(
    email: string
  ): Promise<Result<undefined, EmailAlreadyInUseError>> {
    const exists = await this.authUserRepository.existsByEmail(email);
    if (exists) {
      return Result.fail(new EmailAlreadyInUseError(email));
    }
    return Result.ok(undefined);
  }

  private async checkDuplicatePhoneNumber(
    phoneNumber: string
  ): Promise<Result<undefined, PhoneAlreadyInUseError>> {
    const exists = await this.authUserRepository.existsByPhoneNumber(
      phoneNumber
    );
    if (exists) {
      return Result.fail(new PhoneAlreadyInUseError(phoneNumber));
    }
    return Result.ok(undefined);
  }
}

class EmailAlreadyInUseError extends Error {
  readonly name = "EmailAlreadyInUseError";
  constructor(readonly email: string) {
    super("this email address is already in use.");
  }
}

class PhoneAlreadyInUseError extends Error {
  readonly name = "PhoneAlreadyInUseError";
  constructor(readonly phoneNumber: string) {
    super("this phone number is already in use.");
  }
}

export type RegisterHelperResult = ReturnType<
  typeof RegisterHelper.prototype.execute
>;
