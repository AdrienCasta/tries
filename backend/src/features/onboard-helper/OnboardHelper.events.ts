import DomainEvent from "../../shared/infrastructure/DomainEvent.js";
import HelperId from "../../shared/domain/value-objects/HelperId.js";
import { Clock } from "../../shared/domain/services/Clock.js";

export interface HelperOnboardingSucceeded extends DomainEvent {
  readonly eventName: "HelperOnboardingSucceeded";
  readonly helperId: HelperId;
  readonly email: string;
  readonly firstname: string;
  readonly lastname: string;
}

export function createHelperOnboardingSucceeded(
  clock: Clock,
  helperId: HelperId,
  email: string,
  firstname: string,
  lastname: string
): HelperOnboardingSucceeded {
  return {
    eventName: "HelperOnboardingSucceeded",
    occurredAt: clock.now(),
    helperId,
    email,
    firstname,
    lastname,
  };
}

export interface HelperOnboardingFailed extends DomainEvent {
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
