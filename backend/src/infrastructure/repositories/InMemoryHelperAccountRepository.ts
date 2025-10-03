import { HelperAccount } from "../../domain/entities/HelperAccount.js";
import { HelperAccountRepository } from "../../domain/repositories/HelperAccountRepository.js";
import HelperId from "../../domain/value-objects/HelperId.js";
import { Result } from "../../shared/Result.js";

export class InMemoryHelperAccountRepository
  implements HelperAccountRepository
{
  private accounts: Map<string, HelperAccount> = new Map();

  async create(account: HelperAccount) {
    this.accounts.set(account.helperId.toValue(), account);
    return Result.ok(account);
  }

  async findByHelperId(helperId: HelperId): Promise<HelperAccount | null> {
    return this.accounts.get(helperId.toValue()) || null;
  }

  async findByEmail(email: string): Promise<HelperAccount | null> {
    return (
      Array.from(this.accounts.values()).find(
        (account) => account.email.value === email
      ) || null
    );
  }

  async findByPasswordSetupToken(token: string): Promise<HelperAccount | null> {
    return (
      Array.from(this.accounts.values()).find(
        (account) => account.passwordSetupToken?.value === token
      ) || null
    );
  }
}
