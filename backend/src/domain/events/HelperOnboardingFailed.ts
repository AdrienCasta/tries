import DomainEvent from "./DomainEvent.js";
import { Clock } from "../services/Clock.js";

export default interface HelperOnboardingFailed extends DomainEvent {
  readonly eventName: "HelperOnboardingFailed";
  readonly email: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly reason: string;
  readonly error: Error;
}

export function createHelperOnboardingFailed(
  clock: Clock,
  email: string,
  firstname: string,
  lastname: string,
  error: Error
): HelperOnboardingFailed {
  return {
    eventName: "HelperOnboardingFailed",
    occurredAt: clock.now(),
    email,
    firstname,
    lastname,
    reason: error.message,
    error,
  };
}
