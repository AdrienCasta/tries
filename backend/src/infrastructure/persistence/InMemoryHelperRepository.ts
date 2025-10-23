import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import { Result } from "@shared/infrastructure/Result.js";
import SaveHelperError from "@shared/infrastructure/SaveHelperError.js";

export class InMemoryHelperRepository implements HelperRepository {
  private helpers: Map<string, Helper> = new Map();
  private shouldFail: boolean = false;

  async save(helper: Helper): Promise<Result<void, SaveHelperError>> {
    if (this.shouldFail) {
      return Result.fail(
        new SaveHelperError("Infrastructure failure simulated")
      );
    }

    const { id: helperId } = helper;
    this.helpers.set(helperId.toValue(), helper);
    return Result.ok(undefined);
  }

  simulateFailure(): void {
    this.shouldFail = true;
  }

  async findByEmail(email: string): Promise<Helper | null> {
    return (
      Array.from(this.helpers.values()).find(
        (helper) => helper.email.value === email
      ) || null
    );
  }

  async findAll(): Promise<Helper[]> {
    return Array.from(this.helpers.values());
  }

  add(helperData: any): void {
    const helperId = helperData.helperId || `${helperData.firstname}-${helperData.lastname}`;
    this.helpers.set(helperId, helperData);
  }
}
