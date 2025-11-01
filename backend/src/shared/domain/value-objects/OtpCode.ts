import { Result } from "../../infrastructure/Result";
import DomainError from "@shared/domain/DomainError";

export default class OtpCode {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(code: string): Result<OtpCode, OtpError> {
    if (!code || code.trim().length === 0) {
      return Result.fail(new OtpEmptyError());
    }

    if (code.length !== 6) {
      return Result.fail(new OtpInvalidLengthError());
    }

    if (!/^\d{6}$/.test(code)) {
      return Result.fail(new OtpInvalidFormatError());
    }

    return Result.ok(new OtpCode(code));
  }
}

export type OtpError =
  | OtpEmptyError
  | OtpInvalidLengthError
  | OtpInvalidFormatError;

export class OtpEmptyError extends DomainError {
  readonly code = "OTP_EMPTY";
  constructor() {
    super("OTP is required", {});
  }
}

export class OtpInvalidLengthError extends DomainError {
  readonly code = "OTP_INVALID_LENGTH";
  constructor() {
    super("OTP must be 6 digits", {});
  }
}

export class OtpInvalidFormatError extends DomainError {
  readonly code = "OTP_INVALID_FORMAT";
  constructor() {
    super("OTP must contain only digits", {});
  }
}
