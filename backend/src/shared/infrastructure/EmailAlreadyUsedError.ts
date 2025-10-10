import InfrastrctureError from "./InfrastrctureError.js";

export default class EmailAlreadyUsedError extends InfrastrctureError {
  readonly code = "EMAIL_ALREADY_IN_USE";

  constructor(email: string) {
    super("This email address is already in use.", { email });
  }
}
