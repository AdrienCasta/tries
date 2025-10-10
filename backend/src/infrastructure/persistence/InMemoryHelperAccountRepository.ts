import { HelperAccount } from "@shared/domain/entities/HelperAccount.js";
import { HelperAccountRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { Result } from "@shared/infrastructure/Result.js";
import CreateHelperAccountException from "@shared/infrastructure/CreateHelperAccountException.js";
import EmailAlreadyUsedError from "@shared/infrastructure/EmailAlreadyUsedError.js";
import PhoneAlreadyUsedError from "@shared/infrastructure/PhoneAlreadyUsedError.js";

export class InMemoryHelperAccountRepository
  implements HelperAccountRepository
{
  private accounts: Map<string, HelperAccount> = new Map();
  private shouldFail: boolean = false;

  async create(
    account: HelperAccount
  ): Promise<
    Result<
      HelperAccount,
      | CreateHelperAccountException
      | EmailAlreadyUsedError
      | PhoneAlreadyUsedError
    >
  > {
    if (this.shouldFail) {
      return Result.fail(
        new CreateHelperAccountException("Infrastructure failure simulated")
      );
    }

    const existingEmail = await this.findByEmail(account.email.value);
    if (existingEmail) {
      return Result.fail(new EmailAlreadyUsedError(account.email.value));
    }

    const existingPhone = account.phoneNumber
      ? await this.findByPhone(account.phoneNumber.value)
      : null;
    if (existingPhone) {
      return Result.fail(new PhoneAlreadyUsedError(account.phoneNumber!.value));
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
  async findByPhone(phone: string): Promise<HelperAccount | null> {
    return (
      Array.from(this.accounts.values()).find(
        (account) => account.phoneNumber?.value === phone
      ) || null
    );
  }
}
