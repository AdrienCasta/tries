import DomainEvent from "@shared/infrastructure/DomainEvent.js";
import { Clock } from "@shared/domain/services/Clock.js";

export interface HelperCredentialsUpdated extends DomainEvent {
  readonly eventName: "HelperCredentialsUpdated";
  readonly email: string;
}

export function createHelperCredentialsUpdated(
  clock: Clock,
  email: string
): HelperCredentialsUpdated {
  return {
    eventName: "HelperCredentialsUpdated",
    occurredAt: clock.now(),
    email,
  };
}
