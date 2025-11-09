import { Result } from "@shared/infrastructure/Result";
import UpdateProfileCommand from "./update-profile.command";
import UserRepository from "@shared/domain/repositories/UserRepository";
import Firstname from "@shared/domain/value-objects/Firstname";
import Lastname from "@shared/domain/value-objects/Lastname";

export type UpdateProfileResult = Result<void, Error>;

export default class UpdateProfile {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<UpdateProfileResult> {
    const guard = Result.combineObject({
      firstname: Firstname.create(command.firstname),
      lastname: Lastname.create(command.lastname),
    });

    if (Result.isFailure(guard)) {
      return guard;
    }

    const userExists = await this.userRepository.findById(command.userId);
    if (!userExists) {
      return Result.fail(new Error(`User with id ${command.userId} not found`));
    }

    const updateResult = await this.userRepository.update({
      id: command.userId,
      firstname: command.firstname,
      lastname: command.lastname,
      profileStatus: "completed",
    });

    if (Result.isFailure(updateResult)) {
      return updateResult;
    }

    return Result.ok();
  }
}
