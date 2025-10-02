import DomainError from "./DomainError.js";

export default class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }

  static emailRequired(): ValidationError {
    return new ValidationError("Email is required");
  }

  static emailInvalid(): ValidationError {
    return new ValidationError("Invalid email format");
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
