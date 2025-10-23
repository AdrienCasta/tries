import { Result } from "@shared/infrastructure/Result";

interface ValidationHelperRepository {
  findByName(firstname: string, lastname: string): any;
  update(firstname: string, lastname: string, updates: any): void;
}

interface HelperNotificationService {
  notifyRejected(firstname: string, lastname: string, reason?: string): void;
}

export default class RejectHelper {
  constructor(
    private readonly helperRepository: ValidationHelperRepository,
    private readonly notificationService: HelperNotificationService
  ) {}

  async execute(firstname: string, lastname: string, reason?: string): Promise<Result<undefined, Error>> {
    const helper = this.helperRepository.findByName(firstname, lastname);

    if (!helper?.emailConfirmed) {
      return Result.fail(new EmailNotConfirmedError());
    }

    if (helper.rejected) {
      return Result.fail(new HelperAlreadyRejectedError());
    }

    if (reason !== undefined && reason.trim() === "") {
      return Result.fail(new EmptyRejectionReasonError());
    }

    const updates: any = { rejected: true };
    if (reason) {
      updates.rejectionReason = reason;
    }

    this.helperRepository.update(firstname, lastname, updates);
    this.notificationService.notifyRejected(firstname, lastname, reason);
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
