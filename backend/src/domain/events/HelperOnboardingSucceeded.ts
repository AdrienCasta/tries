import DomainEvent from "./DomainEvent.js";
import HelperId from "../value-objects/HelperId.js";

export default interface HelperOnboardingSucceeded extends DomainEvent {
  readonly eventName: "HelperOnboardingSucceeded";
  readonly helperId: HelperId;
  readonly email: string;
  readonly firstname: string;
  readonly lastname: string;
}

export function createHelperOnboardingSucceeded(
  helperId: HelperId,
  email: string,
  firstname: string,
  lastname: string
): HelperOnboardingSucceeded {
  return {
    eventName: "HelperOnboardingSucceeded",
    occurredAt: new Date(),
    helperId,
    email,
    firstname,
    lastname,
  };
}
