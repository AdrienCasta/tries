import { AuthUser } from "@shared/domain/entities/AuthUser.js";
import { AuthRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { Result } from "@shared/infrastructure/Result.js";
import InviteAuthUserException from "@shared/infrastructure/InviteAuthUserException.js";
import EmailAlreadyUsedError from "@shared/infrastructure/EmailAlreadyUsedError.js";
import PhoneAlreadyUsedError from "@shared/infrastructure/PhoneAlreadyUsedError.js";

export class InMemoryHelperAccountRepository implements AuthRepository {
  private accounts: Map<string, AuthUser> = new Map();
  private shouldFail: boolean = false;

  async inviteUser(
    account: AuthUser
  ): Promise<
    Result<
      AuthUser,
      InviteAuthUserException | EmailAlreadyUsedError | PhoneAlreadyUsedError
    >
  > {
    if (this.shouldFail) {
      return Result.fail(
        new InviteAuthUserException("Infrastructure failure simulated")
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

  async delete(helperId: HelperId): Promise<void> {
    this.accounts.delete(helperId.toValue());
  }

  simulateFailure(): void {
    this.shouldFail = true;
  }

  async findByHelperId(helperId: HelperId): Promise<AuthUser | null> {
    return this.accounts.get(helperId.toValue()) || null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    return (
      Array.from(this.accounts.values()).find(
        (account) => account.email.value === email
      ) || null
    );
  }
  async findByPhone(phone: string): Promise<AuthUser | null> {
    return (
      Array.from(this.accounts.values()).find(
        (account) => account.phoneNumber?.value === phone
      ) || null
    );
  }
}
