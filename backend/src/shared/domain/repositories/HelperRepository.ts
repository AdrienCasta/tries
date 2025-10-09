import { Helper } from "../entities/Helper.js";

export interface HelperRepository {
  save(helper: Helper): Promise<void>;
}
