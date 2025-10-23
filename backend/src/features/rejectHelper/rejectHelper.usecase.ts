import { Result } from "@shared/infrastructure/Result";

interface ValidationHelperRepository {
  findByName(firstname: string, lastname: string): any;
  update(firstname: string, lastname: string, updates: any): void;
}

interface HelperNotificationService {
  notifyRejected(firstname: string, lastname: string): void;
}

export default class RejectHelper {
  constructor(
    private readonly helperRepository: ValidationHelperRepository,
    private readonly notificationService: HelperNotificationService
  ) {}

  async execute(firstname: string, lastname: string): Promise<Result<undefined, Error>> {
    const helper = this.helperRepository.findByName(firstname, lastname);

    if (helper?.rejected) {
      return Result.fail(new HelperAlreadyRejectedError());
    }

    this.helperRepository.update(firstname, lastname, { rejected: true });
    this.notificationService.notifyRejected(firstname, lastname);
    return Result.ok(undefined);
  }
}

class HelperAlreadyRejectedError extends Error {
  readonly name = "HelperAlreadyRejectedError";
  constructor() {
    super("Helper is already rejected");
  }
}
