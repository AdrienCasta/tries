import { Helper } from "../../domain/entities/Helper.js";
import { HelperRepository } from "../../domain/repositories/HelperRepository.js";

export class InMemoryHelperRepository implements HelperRepository {
  private helpers: Map<string, Helper> = new Map();

  async save(helper: Helper): Promise<void> {
    const { id: helperId } = helper;
    this.helpers.set(helperId.toValue(), helper);
  }

  async findByEmail(email: string): Promise<Helper | null> {
    return (
      Array.from(this.helpers.values()).find(
        (helper) => helper.email.value === email
      ) || null
    );
  }
}
