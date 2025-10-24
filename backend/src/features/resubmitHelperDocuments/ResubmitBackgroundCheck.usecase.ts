import { Result } from "@shared/infrastructure/Result";

interface HelperRepository {
  findByEmail(email: string): any;
  update(email: string, updates: any): void;
}

export default class ResubmitBackgroundCheck {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute(email: string): Promise<Result<void, Error>> {
    const helper = this.helperRepository.findByEmail(email);

    if (helper?.underReview) {
      return Result.fail(new HelperUnderReviewError());
    }

    const updates: any = {};

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
