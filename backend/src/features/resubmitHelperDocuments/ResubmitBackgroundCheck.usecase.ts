import { Result } from "@shared/infrastructure/Result";

interface HelperRepository {
  findByName(firstname: string, lastname: string): any;
  update(firstname: string, lastname: string, updates: any): void;
}

export default class ResubmitBackgroundCheck {
  constructor(private readonly helperRepository: HelperRepository) {}

  async execute(firstname: string, lastname: string): Promise<Result<undefined, Error>> {
    const helper = this.helperRepository.findByName(firstname, lastname);

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
      this.helperRepository.update(firstname, lastname, updates);
    }

    return Result.ok(undefined);
  }
}

class HelperUnderReviewError extends Error {
  readonly name = "HelperUnderReviewError";
  constructor() {
    super("Cannot resubmit documents while under admin review");
  }
}
