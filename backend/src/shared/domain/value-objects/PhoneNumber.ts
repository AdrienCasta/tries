import DomainError from "@shared/infrastructure/DomainError.js";
import { Result } from "../../infrastructure/Result.js";

export default class PhoneNumber {
  readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(phoneNumber: string): Result<PhoneNumber, PhoneNumberError> {
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!isValidPhoneNumber(trimmedPhoneNumber)) {
      return Result.fail(new PhoneNumberError(phoneNumber));
    }

    return Result.ok(new PhoneNumber(trimmedPhoneNumber));
  }

  toValue(): string {
    return this.value;
  }
}

function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phone);
}

export class PhoneNumberError extends DomainError {
  readonly code = "PHONE_NUMBER_INVALID";
  constructor(phone: string) {
    super("Phone number must be in E.164 format (e.g., +33612345678)", {
      phone,
    });
  }
}
