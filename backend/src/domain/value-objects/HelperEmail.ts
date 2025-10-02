import { Result } from "../../shared/Result.js";
import ValidationError from "../errors/ValidationError.js";

export default class HelperEmail {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(email: string): Result<HelperEmail, ValidationError> {
    if (isEmailEmpty(email)) {
      return Result.fail(ValidationError.emailRequired());
    }
    if (!isValidEmail(email)) {
      return Result.fail(ValidationError.emailInvalid());
    }
    return Result.ok(new HelperEmail(email));
  }

  toValue(): string {
    return this.value;
  }
}

function isValidEmail(email: string) {
  email = email?.trim();

  if (!email || email.length > 254) return false;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email);
}

function isEmailEmpty(email: string) {
  email = email?.trim();
  return email === "";
}
