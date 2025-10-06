import { Result } from "../../infrastructure/Result.js";
import ValidationError from "../../infrastructure/ValidationError.js";

export default class PhoneNumber {
  readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(phoneNumber?: string): Result<PhoneNumber | null, ValidationError> {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return Result.ok(null);
    }

    const trimmed = phoneNumber.trim();

    if (!isValidPhoneNumber(trimmed)) {
      return Result.fail(ValidationError.phoneNumberInvalid());
    }

    return Result.ok(new PhoneNumber(trimmed));
  }

  toValue(): string {
    return this.value;
  }
}

function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{8,14}$/;
  return phoneRegex.test(phone);
}
