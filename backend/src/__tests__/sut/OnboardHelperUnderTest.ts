import { expect } from "vitest";

import { User } from "../../domain/entities/User.js";
import { OnboardHelper } from "../../application/use-cases/OnboardHelper.js";
import { InMemoryHelperRepository } from "../../infrastructure/repositories/InMemoryHelperRepository.js";
import { InMemoryHelperAccountRepository } from "../../infrastructure/repositories/InMemoryHelperAccountRepository.js";
import { InMemoryOnboardingHelperNotificationService } from "../../infrastructure/services/InMemoryOnboardingHelperNotificationService.js";
import { Helper } from "../../domain/entities/Helper.js";
import { FixedClock } from "../doubles/FixedClock.js";

export default class OnboardHelperUnderTest {
  private helperRepository!: InMemoryHelperRepository;
  private helperAccountRepository!: InMemoryHelperAccountRepository;
  private notificationService!: InMemoryOnboardingHelperNotificationService;
  private clock!: FixedClock;
  private useCase!: OnboardHelper;

  setup(): void {
    this.helperRepository = new InMemoryHelperRepository();
    this.helperAccountRepository = new InMemoryHelperAccountRepository();
    this.notificationService = new InMemoryOnboardingHelperNotificationService({
      companyName: "Tries",
      supportEmailContact: "tries@support.fr",
      passwordSetupUrl: "https://tries.fr/setup-password",
    });
    this.clock = new FixedClock();

    this.useCase = new OnboardHelper(
      this.helperRepository,
      this.helperAccountRepository,
      this.notificationService,
      this.clock
    );
  }

  async onboardUser(user: User) {
    return await this.useCase.execute(user);
  }

  async isHelperOnboarded(email: string): Promise<boolean> {
    const helper = await this.helperRepository.findByEmail(email);
    return helper !== null;
  }

  async hasReceivedNotification(email: string): Promise<boolean> {
    return await this.notificationService.hasSentTo(email);
  }

  async getNotificationContent(email: string): Promise<string | null> {
    return await this.notificationService.getNotificationContent(email);
  }
  async findHelperByEmail(email: string): Promise<Helper | null> {
    return this.helperRepository.findByEmail(email);
  }

  clearNotification() {
    this.notificationService.clear();
  }
}
