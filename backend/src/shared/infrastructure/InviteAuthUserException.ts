import InfraException from "./InfraException.js";

export default class InviteAuthUserException extends InfraException {
  readonly code = "InviteAuthUserException";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
