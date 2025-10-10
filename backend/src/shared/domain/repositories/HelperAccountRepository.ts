import { Result } from "../../infrastructure/Result.js";
import { HelperAccount } from "../entities/HelperAccount.js";
import HelperId from "../value-objects/HelperId.js";
import CreateHelperAccountException from "../../infrastructure/CreateHelperAccountException.js";
import EmailAlreadyUsedError from "../../infrastructure/EmailAlreadyUsedError.js";
import PhoneAlreadyUsedError from "../../infrastructure/PhoneAlreadyUsedError.js";

export interface HelperAccountRepository {
  create(
    account: HelperAccount
  ): Promise<
    Result<
      HelperAccount,
      | CreateHelperAccountException
      | EmailAlreadyUsedError
      | PhoneAlreadyUsedError
    >
  >;
  findByHelperId(helperId: HelperId): Promise<HelperAccount | null>;
  findByEmail(email: string): Promise<HelperAccount | null>;
  findByPhone(phone: string): Promise<HelperAccount | null>;
}
