import DomainError from "./DomainError.js";

export default class PasswordSetupError extends DomainError {
  readonly code = "PASSWORD_SETUP_ERROR";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }

  static tokenExpired(): PasswordSetupError {
    return new PasswordSetupError("Token expired");
  }

  static tokenInvalid(): PasswordSetupError {
    return new PasswordSetupError("Invalid token");
  }

  static passwordAlreadySet(): PasswordSetupError {
    return new PasswordSetupError("Password already set");
  }
}
