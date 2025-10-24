import { HelperForValidation } from "@features/validation/domain/HelperForValidation";
import { ValidationHelperRepository } from "@features/validation/domain/ValidationHelperRepository";

export class InMemoryValidationHelperRepository
  implements ValidationHelperRepository
{
  private helpers: HelperForValidation[] = [];

  add(helper: HelperForValidation): void {
    this.helpers.push(helper);
  }

  async findAll(): Promise<HelperForValidation[]> {
    return this.helpers;
  }

  findByEmail(email: string): HelperForValidation | undefined {
    return this.helpers.find((h) => h.email === email);
  }

  update(email: string, updates: Partial<HelperForValidation>): void {
    const helper = this.findByEmail(email);
    if (helper) {
      Object.assign(helper, updates);
    }
  }
}
