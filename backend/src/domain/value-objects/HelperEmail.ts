import { Result } from "../../shared/Result.js";
import InvalidEmailError from "../errors/InvalidEmailError.js";
import ValidationError from "../errors/ValidationError.js";

export default class HelperEmail {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(email: string): Result<HelperEmail, InvalidEmailError> {
    const validationResult = validateEmail(email);
    if (!validationResult.isValid) {
      return Result.fail(new InvalidEmailError(validationResult.errorMessage!));
    }
    return Result.ok(new HelperEmail(email));
  }

  toValue(): string {
    return this.value;
  }
}

function validateEmail(email: string): { isValid: boolean; errorMessage?: string } {
  const trimmedEmail = email?.trim();

  if (!trimmedEmail || trimmedEmail === "") {
    return { isValid: false, errorMessage: "Email is required" };
  }

  if (trimmedEmail.length > 254) {
    return { isValid: false, errorMessage: "Invalid email format" };
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(trimmedEmail)) {
    return { isValid: false, errorMessage: "Invalid email format" };
  }

  return { isValid: true };
}
