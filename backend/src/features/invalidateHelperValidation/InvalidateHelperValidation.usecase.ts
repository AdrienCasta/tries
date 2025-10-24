import { Result } from "@shared/infrastructure/Result";
import { HelperForValidation } from "@features/validation/domain/HelperForValidation";
import { ValidationHelperRepository } from "@features/validation/domain/ValidationHelperRepository";

export default class InvalidateHelperValidation {
  constructor(private readonly helperRepository: ValidationHelperRepository) {}

  async execute(email: string): Promise<Result<void, Error>> {
    const helper = this.helperRepository.findByEmail(email);

    if (helper?.underReview) {
      return Result.fail(new HelperUnderReviewError());
    }

    const updates: Partial<HelperForValidation> = {};

    if (helper?.profileValidated) {
      updates.profileValidated = false;
    }

    if (helper?.rejected) {
      updates.rejected = false;
      updates.rejectionReason = undefined;
    }

    if (Object.keys(updates).length > 0) {
      this.helperRepository.update(email, updates);
    }

    return Result.ok();
  }
}

class HelperUnderReviewError extends Error {
  readonly name = "HelperUnderReviewError";
  constructor() {
    super("Cannot resubmit documents while under admin review");
  }
}
