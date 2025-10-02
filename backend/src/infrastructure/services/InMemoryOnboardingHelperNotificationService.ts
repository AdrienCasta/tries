import { OnboardingHelperNotificationService } from "../../domain/services/OnboardingHelperNotificationService.js";

export class InMemoryOnboardingHelperNotificationService
  implements OnboardingHelperNotificationService
{
  private notifications: Map<string, string> = new Map();

  async send(email: string, message: string): Promise<void> {
    this.notifications.set(email, message);
  }

  async hasSentTo(email: string): Promise<boolean> {
    return this.notifications.has(email);
  }
}
