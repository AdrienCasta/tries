import { Result } from "@shared/infrastructure/Result";

interface ValidationHelperRepository {
  findByEmail(email: string): any;
  update(email: string, updates: any): void;
}

interface HelperNotificationService {
  notifyRejected(email: string, reason?: string): void;
}

export default class RejectHelper {
  constructor(
    private readonly helperRepository: ValidationHelperRepository,
    private readonly notificationService: HelperNotificationService
  ) {}

  async execute(email: string, reason?: string): Promise<Result<undefined, Error>> {
    const helper = this.helperRepository.findByEmail(email);

    if (!helper?.emailConfirmed) {
      return Result.fail(new EmailNotConfirmedError());
    }

    if (helper.rejected) {
      return Result.fail(new HelperAlreadyRejectedError());
    }

    if (reason !== undefined && reason.trim() === "") {
      return Result.fail(new EmptyRejectionReasonError());
    }

    const updates: any = {
      rejected: true,
      underReview: false
    };
    if (reason) {
      updates.rejectionReason = reason;
    }

    this.helperRepository.update(email, updates);
    this.notificationService.notifyRejected(email, reason);
    return Result.ok(undefined);
  }
}

class HelperAlreadyRejectedError extends Error {
  readonly name = "HelperAlreadyRejectedError";
  constructor() {
    super("Helper is already rejected");
  }
}

class EmailNotConfirmedError extends Error {
  readonly name = "EmailNotConfirmedError";
  constructor() {
    super("Cannot reject helper with unconfirmed email");
  }
}

class EmptyRejectionReasonError extends Error {
  readonly name = "EmptyRejectionReasonError";
  constructor() {
    super("Rejection reason is required");
  }
}
