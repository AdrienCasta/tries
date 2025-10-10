import { Result } from "../../infrastructure/Result.js";
import { Helper } from "../entities/Helper.js";
import SaveHelperError from "../../infrastructure/SaveHelperError.js";

export interface HelperRepository {
  save(helper: Helper): Promise<Result<void, SaveHelperError>>;
  findByEmail(email: string): Promise<Helper | null>;
}
