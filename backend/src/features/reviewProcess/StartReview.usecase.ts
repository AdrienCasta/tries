import { Result } from "@shared/infrastructure/Result";

interface HelperRepository {
  findByEmail(email: string): any;
  update(email: string, updates: any): void;
  isHelperRejected(email: string): boolean;
}

export default class StartReview {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute(email: string): Promise<Result<void, Error>> {
    const helper = this.helperRepository.findByEmail(email);

    if (!helper) {
      return Result.fail(new HelperNotFoundError());
    }

    if (helper.profileValidated) {
      return Result.fail(new HelperAlreadyValidatedError());
    }

    if (this.helperRepository.isHelperRejected(email)) {
      return Result.fail(new HelperRejectedError());
    }

    if (helper.underReview) {
      return Result.fail(new HelperAlreadyUnderReviewError());
    }

    const isPendingReview = (
      helper.emailConfirmed &&
      helper.credentialsSubmitted &&
      helper.backgroundCheckSubmitted &&
      !helper.profileValidated &&
      !helper.underReview
    );

    if (!isPendingReview) {
      return Result.fail(new HelperNotPendingReviewError());
    }

    this.helperRepository.update(email, { underReview: true });
    return Result.ok();
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

class HelperRejectedError extends Error {
  readonly name = "HelperRejectedError";
  constructor() {
    super("Helper has been rejected");
  }
}

class HelperNotPendingReviewError extends Error {
  readonly name = "HelperNotPendingReviewError";
  constructor() {
    super("Helper is not pending review");
  }
}

class HelperAlreadyUnderReviewError extends Error {
  readonly name = "HelperAlreadyUnderReviewError";
  constructor() {
    super("Helper is already under review");
  }
}
