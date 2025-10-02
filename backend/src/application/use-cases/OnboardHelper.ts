import { User } from "../../domain/entities/User.js";
import { Helper } from "../../domain/entities/Helper.js";
import HelperId from "../../domain/value-objects/HelperId.js";
import { HelperRepository } from "../../domain/repositories/HelperRepository.js";
import HelperEmail from "../../domain/value-objects/HelperEmail.js";
import Firstname from "../../domain/value-objects/Firstname.js";
import Lastname from "../../domain/value-objects/Lastname.js";
import { Result } from "../../shared/Result.js";
import ValidationError from "../../domain/errors/ValidationError.js";

export class OnboardHelper {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute({
    email,
    firstname,
    lastname,
  }: User): Promise<Result<HelperId, ValidationError>> {
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

    const helper: Helper = {
      id: HelperId.create(),
      email: emailResult.value,
      firstname: firstnameResult.value,
      lastname: lastnameResult.value,
    };

    await this.helperRepository.save(helper);

    return Result.ok(helper.id);
  }
}
