import { HelperAccount } from "@shared/domain/entities/HelperAccount.js";
import { HelperAccountRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { Result } from "@shared/infrastructure/Result.js";
import CreateHelperAccountException from "@shared/infrastructure/CreateHelperAccountException.js";

export class InMemoryHelperAccountRepository
  implements HelperAccountRepository
{
  private accounts: Map<string, HelperAccount> = new Map();
  private shouldFail: boolean = false;

  async create(account: HelperAccount) {
    if (this.shouldFail) {
      return Result.fail(
        new CreateHelperAccountException("Infrastructure failure simulated")
      );
    }
    this.accounts.set(account.helperId.toValue(), account);
    return Result.ok(account);
  }

  simulateFailure(): void {
    this.shouldFail = true;
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
