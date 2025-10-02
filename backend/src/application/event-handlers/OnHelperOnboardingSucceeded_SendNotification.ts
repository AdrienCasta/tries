import HelperOnboardingSucceeded from "../../domain/events/HelperOnboardingSucceeded.js";
import { OnboardingHelperNotificationService } from "../../domain/services/OnboardingHelperNotificationService.js";

export default class OnHelperOnboardingSucceeded_SendNotification {
  constructor(
    private readonly notificationService: OnboardingHelperNotificationService
  ) {}

  async handle(event: HelperOnboardingSucceeded): Promise<void> {
    await this.notificationService.send(
      event.email,
      `Welcome ${event.firstname}! You have been successfully onboarded as a helper.`
    );
  }
}
