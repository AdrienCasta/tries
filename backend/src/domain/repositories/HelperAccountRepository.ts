import { HelperAccount } from "../entities/HelperAccount.js";
import HelperId from "../value-objects/HelperId.js";

export interface HelperAccountRepository {
  save(account: HelperAccount): Promise<void>;
  findByHelperId(helperId: HelperId): Promise<HelperAccount | null>;
  findByEmail(email: string): Promise<HelperAccount | null>;
  findByPasswordSetupToken(token: string): Promise<HelperAccount | null>;
}
