import DomainError from "./DomainError.js";

export default class DuplicateHelperError extends DomainError {
  readonly code = "DUPLICATE_HELPER_ERROR";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }

  static forEmail(email: string): DuplicateHelperError {
    return new DuplicateHelperError("Helper with this email already exists", {
      email,
    });
  }
}
