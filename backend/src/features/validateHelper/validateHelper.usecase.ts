import { Result } from "@shared/infrastructure/Result";

interface ValidationHelperRepository {
  findByName(firstname: string, lastname: string): any;
  update(firstname: string, lastname: string, updates: any): void;
}

export default class ValidateHelper {
  constructor(private readonly helperRepository: ValidationHelperRepository) {}

  async execute(firstname: string, lastname: string): Promise<Result<undefined, Error>> {
    const helper = this.helperRepository.findByName(firstname, lastname);

    if (!helper) {
      return Result.fail(new HelperNotFoundError());
    }

    if (helper.profileValidated) {
      return Result.fail(new HelperAlreadyValidatedError());
    }

    if (!helper.credentialsSubmitted) {
      return Result.fail(new MissingCredentialsError());
    }

    if (!helper.backgroundCheckSubmitted) {
      return Result.fail(new MissingBackgroundCheckError());
    }

    this.helperRepository.update(firstname, lastname, { profileValidated: true });
    return Result.ok(undefined);
  }
}

class HelperNotFoundError extends Error {
  readonly name = "HelperNotFoundError";
  constructor() {
    super("Helper not found");
  }
}

class HelperAlreadyValidatedError extends Error {
  readonly name = "HelperAlreadyValidatedError";
  constructor() {
    super("Helper is already validated");
  }
}

class MissingCredentialsError extends Error {
  readonly name = "MissingCredentialsError";
  constructor() {
    super("Cannot validate without credentials");
  }
}

class MissingBackgroundCheckError extends Error {
  readonly name = "MissingBackgroundCheckError";
  constructor() {
    super("Cannot validate without background screening");
  }
}
