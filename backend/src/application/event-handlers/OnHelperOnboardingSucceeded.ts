import HelperOnboardingSucceeded from "../../domain/events/HelperOnboardingSucceeded.js";

export default class OnHelperOnboardingSucceeded {
  async handle(event: HelperOnboardingSucceeded): Promise<void> {
    console.log("Helper onboarding succeeded:", {
      helperId: event.helperId.value,
      email: event.email,
      firstname: event.firstname,
      lastname: event.lastname,
      occurredAt: event.occurredAt,
    });

    // Additional actions:
    // - Send analytics event
    // - Update metrics/dashboards
    // - Trigger welcome workflow
    // - Provision additional resources
  }
}
