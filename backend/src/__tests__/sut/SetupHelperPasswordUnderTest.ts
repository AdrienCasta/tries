import { Helper } from "../../domain/entities/Helper.js";
import { InMemoryHelperRepository } from "../../infrastructure/repositories/InMemoryHelperRepository.js";
import { OnboardHelper } from "../../application/use-cases/OnboardHelper.js";
import { SetupHelperPassword } from "../../application/use-cases/SetupHelperPassword.js";
import { InMemoryOnboardingHelperNotificationService } from "../../infrastructure/services/InMemoryOnboardingHelperNotificationService.js";
import { User } from "../../domain/entities/User.js";
import PasswordSetupToken from "../../domain/value-objects/PasswordSetupToken.js";
import Password from "../../domain/value-objects/Password.js";

export default class SetupHelperPasswordUnderTest {
  private helperRepository!: InMemoryHelperRepository;
  private onboardHelperUseCase!: OnboardHelper;
  private setupHelperPasswordUseCase!: SetupHelperPassword;
  private notificationService!: InMemoryOnboardingHelperNotificationService;

  setup(): void {
    this.helperRepository = new InMemoryHelperRepository();
    this.notificationService = new InMemoryOnboardingHelperNotificationService({
      companyName: "Tries",
      supportEmailContact: "tries@support.fr",
      passwordSetupUrl: "https://tries.fr/setup-password",
    });
    this.onboardHelperUseCase = new OnboardHelper(
      this.helperRepository,
      this.notificationService
    );
    this.setupHelperPasswordUseCase = new SetupHelperPassword(
      this.helperRepository
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

  async getHelperByToken(token: string): Promise<Helper | null> {
    return await this.helperRepository.findByPasswordSetupToken(token);
  }

  async getHelperByEmail(email: string): Promise<Helper | null> {
    return await this.helperRepository.findByEmail(email);
  }

  async verifyPassword(email: string, plainPassword: string): Promise<boolean> {
    const helper = await this.helperRepository.findByEmail(email);
    if (!helper || !helper.password) {
      return false;
    }
    return await helper.password.compare(plainPassword);
  }

  async hasPasswordSet(email: string): Promise<boolean> {
    const helper = await this.helperRepository.findByEmail(email);
    return helper?.password !== undefined;
  }

  async getPasswordSetupToken(email: string): Promise<string | null> {
    const helper = await this.helperRepository.findByEmail(email);
    return helper?.passwordSetupToken?.value || null;
  }

  async setHelperPasswordDirectly(email: string, password: string): Promise<string | null> {
    const helper = await this.helperRepository.findByEmail(email);
    if (helper) {
      const passwordResult = await Password.create(password);
      if (passwordResult.success) {
        const tokenValue = helper.passwordSetupToken?.value || null;

        helper.password = passwordResult.value;
        helper.passwordSetAt = new Date();
        await this.helperRepository.save(helper);

        return tokenValue;
      }
    }
    return null;
  }

  async createHelperWithExpiredToken(user: User, hoursAgo: number): Promise<Helper | null> {
    const helper = await this.onboardHelper(user);
    if (helper && helper.passwordSetupToken) {
      // Create token that expired in the past
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - hoursAgo);
      helper.passwordSetupToken = PasswordSetupToken.fromValues(
        helper.passwordSetupToken.value,
        expiredDate
      );
      await this.helperRepository.save(helper);
      return helper;
    }
    return null;
  }
}
