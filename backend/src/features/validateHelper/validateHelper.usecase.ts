import { Result } from "@shared/infrastructure/Result";
import { HelperForValidation } from "@features/validation/domain/HelperForValidation";
import { ValidationHelperRepository } from "@features/validation/domain/ValidationHelperRepository";
import { HelperNotFoundError } from "@shared/domain/errors/HelperValidation.errors";

interface HelperNotificationService {
  notifyValidated(email: string): void;
}

export default class ValidateHelper {
  constructor(
    private readonly helperRepository: ValidationHelperRepository,
    private readonly notificationService: HelperNotificationService
  ) {}

  async execute(email: string): Promise<Result<void, Error>> {
    const helper = this.helperRepository.findByEmail(email);

    // Validation order is designed to return the most specific error first:
    // 1. Helper existence - must exist to validate
    // 2. Email confirmed - business rule: can't validate unconfirmed
    // 3. Already validated - prevent duplicate validation
    // 4. Rejected status - rejected helpers must resubmit first
    // 5. Required documents - must have all documents
    // 6. Under review - workflow enforcement (admin must start review first)

    if (!helper) {
      return Result.fail(new HelperNotFoundError());
    }

    if (!helper.emailConfirmed) {
      return Result.fail(new EmailNotConfirmedError());
    }

    if (helper.profileValidated) {
      return Result.fail(new HelperAlreadyValidatedError());
    }

    if (helper.rejected) {
      return Result.fail(new HelperRejectedError());
    }

    if (!helper.credentialsSubmitted) {
      return Result.fail(new MissingCredentialsError());
    }

    if (!helper.backgroundCheckSubmitted) {
      return Result.fail(new MissingBackgroundCheckError());
    }

    if (!helper.underReview) {
      return Result.fail(new HelperNotUnderReviewError());
    }

    const updates: Partial<HelperForValidation> = {
      profileValidated: true,
      underReview: false,
    };

    this.helperRepository.update(email, updates);
    this.notificationService.notifyValidated(email);
    return Result.ok();
  }
}

class HelperAlreadyValidatedError extends Error {
  readonly code = "HELPER_ALREADY_VALIDATED";
  constructor() {
    super("Helper is already validated");
  }
}

class MissingCredentialsError extends Error {
  readonly code = "MISSING_CREDENTIALS";
  constructor() {
    super("Cannot validate without credentials");
  }
}

class MissingBackgroundCheckError extends Error {
  readonly code = "MISSING_BACKGROUND_CHECK";
  constructor() {
    super("Cannot validate without background screening");
  }
}

class HelperRejectedError extends Error {
  readonly code = "HELPER_REJECTED";
  constructor() {
    super("Cannot validate rejected helper");
  }
}

class EmailNotConfirmedError extends Error {
  readonly code = "EMAIL_NOT_CONFIRMED";
  constructor() {
    super("Cannot validate helper with unconfirmed email");
  }
}

class HelperNotUnderReviewError extends Error {
  readonly code = "HELPER_NOT_UNDER_REVIEW";
  constructor() {
    super("Helper must be under review before validation");
  }
}
