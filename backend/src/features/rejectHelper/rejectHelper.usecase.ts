import { Result } from "@shared/infrastructure/Result";
import type { HelperForValidation } from "@infrastructure/persistence/InMemoryValidationHelperRepository";
import { HelperNotFoundError } from "@shared/domain/errors/HelperValidation.errors";

interface ValidationHelperRepository {
  findByEmail(email: string): HelperForValidation | undefined;
  update(email: string, updates: Partial<HelperForValidation>): void;
}

interface HelperNotificationService {
  notifyRejected(email: string, reason?: string): void;
}

export default class RejectHelper {
  constructor(
    private readonly helperRepository: ValidationHelperRepository,
    private readonly notificationService: HelperNotificationService
  ) {}

  async execute(email: string, reason?: string): Promise<Result<void, Error>> {
    const helper = this.helperRepository.findByEmail(email);

    // Validation order is designed to return the most specific error first:
    // 1. Helper existence - must exist to reject
    // 2. Email confirmed - business rule: can't reject unconfirmed
    // 3. Already rejected - prevent duplicate rejection
    // 4. Under review - workflow enforcement (admin must start review first)
    // 5. Empty reason validation - if reason provided, must not be empty

    if (!helper) {
      return Result.fail(new HelperNotFoundError());
    }

    if (!helper.emailConfirmed) {
      return Result.fail(new EmailNotConfirmedError());
    }

    if (helper.rejected) {
      return Result.fail(new HelperAlreadyRejectedError());
    }

    if (!helper.underReview) {
      return Result.fail(new HelperNotUnderReviewError());
    }

    if (reason !== undefined && reason.trim() === "") {
      return Result.fail(new EmptyRejectionReasonError());
    }

    const updates: Partial<HelperForValidation> = {
      rejected: true,
      underReview: false,
    };

    if (reason) {
      updates.rejectionReason = reason;
    }

    this.helperRepository.update(email, updates);
    this.notificationService.notifyRejected(email, reason);
    return Result.ok();
  }
}

class HelperAlreadyRejectedError extends Error {
  readonly code = "HELPER_ALREADY_REJECTED";
  constructor() {
    super("Helper is already rejected");
  }
}

class EmptyRejectionReasonError extends Error {
  readonly code = "EMPTY_REJECTION_REASON";
  constructor() {
    super("Rejection reason is required");
  }
}

class EmailNotConfirmedError extends Error {
  readonly code = "EMAIL_NOT_CONFIRMED";
  constructor() {
    super("Cannot reject helper with unconfirmed email");
  }
}

class HelperNotUnderReviewError extends Error {
  readonly code = "HELPER_NOT_UNDER_REVIEW";
  constructor() {
    super("Helper must be under review before rejection");
  }
}
