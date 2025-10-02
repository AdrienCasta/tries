import DomainEvent from "./DomainEvent.js";

export default interface HelperOnboardingFailed extends DomainEvent {
  readonly eventName: "HelperOnboardingFailed";
  readonly email: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly reason: string;
  readonly error: Error;
}

export function createHelperOnboardingFailed(
  email: string,
  firstname: string,
  lastname: string,
  error: Error
): HelperOnboardingFailed {
  return {
    eventName: "HelperOnboardingFailed",
    occurredAt: new Date(),
    email,
    firstname,
    lastname,
    reason: error.message,
    error,
  };
}
