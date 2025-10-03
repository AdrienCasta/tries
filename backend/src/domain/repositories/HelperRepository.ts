import { Helper } from "../entities/Helper.js";

export interface HelperRepository {
  save(helper: Helper): Promise<void>;
  findByEmail(email: string): Promise<Helper | null>;
  findByPasswordSetupToken(token: string): Promise<Helper | null>;
}
