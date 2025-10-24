import { HelperForValidation } from "./HelperForValidation";

export interface ValidationHelperRepository {
  findByEmail(email: string): HelperForValidation | undefined;
  update(email: string, updates: Partial<HelperForValidation>): void;
}
