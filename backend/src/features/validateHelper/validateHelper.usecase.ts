import { Result } from "@shared/infrastructure/Result";

interface ValidationHelperRepository {
  findByEmail(email: string): any;
  update(email: string, updates: any): void;
  isHelperRejected(email: string): boolean;
}

interface HelperNotificationService {
  notifyValidated(email: string): void;
}

export default class ValidateHelper {
  constructor(
    private readonly helperRepository: ValidationHelperRepository,
    private readonly notificationService: HelperNotificationService
  ) {}

  async execute(email: string): Promise<Result<undefined, Error>> {
    const helper = this.helperRepository.findByEmail(email);

    if (!helper) {
      return Result.fail(new HelperNotFoundError());
    }

    if (!helper.emailConfirmed) {
      return Result.fail(new EmailNotConfirmedError());
    }

    if (helper.profileValidated) {
      return Result.fail(new HelperAlreadyValidatedError());
    }

    if (this.helperRepository.isHelperRejected(email)) {
      return Result.fail(new HelperRejectedError());
    }

    if (!helper.credentialsSubmitted) {
      return Result.fail(new MissingCredentialsError());
    }

    if (!helper.backgroundCheckSubmitted) {
      return Result.fail(new MissingBackgroundCheckError());
    }

    this.helperRepository.update(email, {
      profileValidated: true,
      underReview: false
    });
    this.notificationService.notifyValidated(email);
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

class HelperRejectedError extends Error {
  readonly name = "HelperRejectedError";
  constructor() {
    super("Cannot validate rejected helper");
  }
}

class EmailNotConfirmedError extends Error {
  readonly name = "EmailNotConfirmedError";
  constructor() {
    super("Cannot validate helper with unconfirmed email");
  }
}
