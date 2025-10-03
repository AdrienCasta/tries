import { Helper } from "../../domain/entities/Helper.js";
import { HelperAccount } from "../../domain/entities/HelperAccount.js";
import { InMemoryHelperRepository } from "../../infrastructure/repositories/InMemoryHelperRepository.js";
import { InMemoryHelperAccountRepository } from "../../infrastructure/repositories/InMemoryHelperAccountRepository.js";
import { OnboardHelper } from "../../application/use-cases/OnboardHelper.js";
import { SetupHelperPassword } from "../../application/use-cases/SetupHelperPassword.js";
import { InMemoryOnboardingHelperNotificationService } from "../../infrastructure/services/InMemoryOnboardingHelperNotificationService.js";
import { User } from "../../domain/entities/User.js";
import PasswordSetupToken from "../../domain/value-objects/PasswordSetupToken.js";
import Password from "../../domain/value-objects/Password.js";

export default class SetupHelperPasswordUnderTest {
  private helperRepository!: InMemoryHelperRepository;
  private helperAccountRepository!: InMemoryHelperAccountRepository;
  private onboardHelperUseCase!: OnboardHelper;
  private setupHelperPasswordUseCase!: SetupHelperPassword;
  private notificationService!: InMemoryOnboardingHelperNotificationService;

  setup(): void {
    this.helperRepository = new InMemoryHelperRepository();
    this.helperAccountRepository = new InMemoryHelperAccountRepository();
    this.notificationService = new InMemoryOnboardingHelperNotificationService({
      companyName: "Tries",
      supportEmailContact: "tries@support.fr",
      passwordSetupUrl: "https://tries.fr/setup-password",
    });
    this.onboardHelperUseCase = new OnboardHelper(
      this.helperRepository,
      this.helperAccountRepository,
      this.notificationService
    );
    this.setupHelperPasswordUseCase = new SetupHelperPassword(
      this.helperAccountRepository
    );
  }

  async onboardHelper(user: User): Promise<Helper | null> {
    const result = await this.onboardHelperUseCase.execute(user);
    if (result.success) {
      return await this.helperRepository.findByEmail(user.email);
    }
    return null;
  }

  async setupPassword(token: string, password: string): Promise<{ success: boolean; error?: string }> {
    const result = await this.setupHelperPasswordUseCase.execute(token, password);

    if (result.success) {
      return { success: true };
    }

    return { success: false, error: result.error.message };
  }

  async getHelperByToken(token: string): Promise<HelperAccount | null> {
    return await this.helperAccountRepository.findByPasswordSetupToken(token);
  }

  async getHelperByEmail(email: string): Promise<Helper | null> {
    return await this.helperRepository.findByEmail(email);
  }

  async verifyPassword(email: string, plainPassword: string): Promise<boolean> {
    const helperAccount = await this.helperAccountRepository.findByEmail(email);
    if (!helperAccount || !helperAccount.password) {
      return false;
    }
    return await helperAccount.password.compare(plainPassword);
  }

  async hasPasswordSet(email: string): Promise<boolean> {
    const helperAccount = await this.helperAccountRepository.findByEmail(email);
    return helperAccount?.password !== undefined;
  }

  async getPasswordSetupToken(email: string): Promise<string | null> {
    const helperAccount = await this.helperAccountRepository.findByEmail(email);
    return helperAccount?.passwordSetupToken?.value || null;
  }

  async setHelperPasswordDirectly(email: string, password: string): Promise<string | null> {
    const helperAccount = await this.helperAccountRepository.findByEmail(email);
    if (helperAccount) {
      const passwordResult = await Password.create(password);
      if (passwordResult.success) {
        const tokenValue = helperAccount.passwordSetupToken?.value || null;

        helperAccount.password = passwordResult.value;
        helperAccount.passwordSetAt = new Date();
        await this.helperAccountRepository.save(helperAccount);

        return tokenValue;
      }
    }
    return null;
  }

  async createHelperWithExpiredToken(user: User, hoursAgo: number): Promise<Helper | null> {
    const helper = await this.onboardHelper(user);
    if (helper) {
      const helperAccount = await this.helperAccountRepository.findByEmail(user.email);
      if (helperAccount && helperAccount.passwordSetupToken) {
        const expiredDate = new Date();
        expiredDate.setHours(expiredDate.getHours() - hoursAgo);
        helperAccount.passwordSetupToken = PasswordSetupToken.fromValues(
          helperAccount.passwordSetupToken.value,
          expiredDate
        );
        await this.helperAccountRepository.save(helperAccount);
      }
      return helper;
    }
    return null;
  }
}
