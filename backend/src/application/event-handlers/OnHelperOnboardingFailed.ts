import HelperOnboardingFailed from "../../domain/events/HelperOnboardingFailed.js";

export default class OnHelperOnboardingFailed {
  async handle(event: HelperOnboardingFailed): Promise<void> {
    console.error("Helper onboarding failed:", {
      email: event.email,
      firstname: event.firstname,
      lastname: event.lastname,
      reason: event.reason,
      occurredAt: event.occurredAt,
    });

    // Additional actions:
    // - Send alert to monitoring system
    // - Log to error tracking service (e.g., Sentry)
    // - Trigger retry logic if applicable
    // - Notify admin team
  }
}
