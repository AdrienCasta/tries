import DomainError from "./DomainError.js";

export default class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }

  static firstnameRequired(): ValidationError {
    return new ValidationError("First name is required");
  }

  static firstnameTooShort(): ValidationError {
    return new ValidationError("First name too short");
  }

  static lastnameRequired(): ValidationError {
    return new ValidationError("Last name is required");
  }

  static lastnameTooShort(): ValidationError {
    return new ValidationError("Last name too short");
  }
}
