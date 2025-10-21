import DomainError from "../domain/DomainError";

export default class InvalidEmailError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
