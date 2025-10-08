import DomainEvent from "@shared/infrastructure/DomainEvent.js";
import { Clock } from "@shared/domain/services/Clock.js";

export interface HelperEmailConfirmationSucceeded extends DomainEvent {
  readonly eventName: "HelperEmailConfirmationSucceeded";
  readonly token: string;
}

export function createHelperEmailConfirmationSucceeded(
  clock: Clock,
  token: string
): HelperEmailConfirmationSucceeded {
  return {
    eventName: "HelperEmailConfirmationSucceeded",
    occurredAt: clock.now(),
    token,
  };
}

export interface HelperEmailConfirmationFailed extends DomainEvent {
  readonly eventName: "HelperEmailConfirmationFailed";
  readonly token: string;
  readonly reason: string;
  readonly error: Error;
}

export function createHelperEmailConfirmationFailed(
  clock: Clock,
  token: string,
  error: Error
): HelperEmailConfirmationFailed {
  return {
    eventName: "HelperEmailConfirmationFailed",
    occurredAt: clock.now(),
    token,
    reason: error.message,
    error,
  };
}
