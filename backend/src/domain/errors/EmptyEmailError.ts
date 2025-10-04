import DomainError from "./DomainError";

export default class EmptyEmailError extends DomainError {
  readonly code = "EMPTY_EMAIL_ERROR";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
