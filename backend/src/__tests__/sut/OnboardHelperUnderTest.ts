import { User } from "../../domain/entities/User.js";
import { OnboardHelper } from "../../application/use-cases/OnboardHelper.js";
import { InMemoryHelperRepository } from "../../infrastructure/repositories/InMemoryHelperRepository.js";
import { InMemoryOnboardingHelperNotificationService } from "../../infrastructure/services/InMemoryOnboardingHelperNotificationService.js";

export default class OnboardHelperUnderTest {
  private helperRepository!: InMemoryHelperRepository;
  private notificationService!: InMemoryOnboardingHelperNotificationService;
  private useCase!: OnboardHelper;

  setup(): void {
    // Initialize infrastructure
    this.helperRepository = new InMemoryHelperRepository();
    this.notificationService =
      new InMemoryOnboardingHelperNotificationService();

    // Create use case
    this.useCase = new OnboardHelper(this.helperRepository);
  }

  // Actions
  async onboardUser(user: User) {
    return await this.useCase.execute(user);
  }

  // Queries - Domain-focused
  async isHelperOnboarded(email: string): Promise<boolean> {
    const helper = await this.helperRepository.findByEmail(email);
    return helper !== null;
  }

  async hasReceivedNotification(email: string): Promise<boolean> {
    return await this.notificationService.hasSentTo(email);
  }
}
