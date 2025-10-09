import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";

export class InMemoryHelperRepository implements HelperRepository {
  private helpers: Map<string, Helper> = new Map();

  async save(helper: Helper): Promise<void> {
    const { id: helperId } = helper;
    this.helpers.set(helperId.toValue(), helper);
  }
}
