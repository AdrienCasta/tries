import { Result } from "../../shared/Result.js";
import { HelperAccount } from "../entities/HelperAccount.js";
import HelperId from "../value-objects/HelperId.js";

export interface HelperAccountRepository {
  create(account: HelperAccount): Promise<Result<HelperAccount>>;
  findByHelperId(helperId: HelperId): Promise<HelperAccount | null>;
  findByEmail(email: string): Promise<HelperAccount | null>;
  findByPasswordSetupToken(token: string): Promise<HelperAccount | null>;
}
