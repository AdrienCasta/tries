import DomainError from "../domain/DomainError";

export default class InvalidEmailError extends DomainError {
  readonly code = "INVALID_EMAIL_ERROR";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
