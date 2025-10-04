// Re-export shared errors used by this feature
export { default as InvalidEmailError } from "../../shared/infrastructure/InvalidEmailError.js";
export { default as ValidationError } from "../../shared/infrastructure/ValidationError.js";

// Feature-specific errors
import DomainError from "../../shared/infrastructure/DomainError.js";

export class DuplicateHelperError extends DomainError {
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
