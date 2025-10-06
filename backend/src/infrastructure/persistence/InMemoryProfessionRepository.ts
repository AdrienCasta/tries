import { ProfessionRepository } from "@shared/domain/repositories/ProfessionRepository.js";
import { VALID_PROFESSIONS } from "@shared/domain/value-objects/Profession.js";

export class InMemoryProfessionRepository implements ProfessionRepository {
  private professions: Set<string>;

  constructor() {
    // Initialize with hardcoded professions for testing
    this.professions = new Set(VALID_PROFESSIONS);
  }

  async findAll(): Promise<string[]> {
    return Array.from(this.professions).sort();
  }

  async exists(professionName: string): Promise<boolean> {
    return this.professions.has(professionName);
  }

  async findByNames(professionNames: string[]): Promise<string[]> {
    return professionNames.filter((name) => this.professions.has(name));
  }

  // Test helper methods
  add(professionName: string): void {
    this.professions.add(professionName);
  }

  remove(professionName: string): void {
    this.professions.delete(professionName);
  }

  clear(): void {
    this.professions.clear();
  }
}
