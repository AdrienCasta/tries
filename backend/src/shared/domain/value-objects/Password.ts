import { randomBytes } from "crypto";
import { Result } from "../../infrastructure/Result.js";
import DomainError from "@shared/infrastructure/DomainError.js";

export default class Password {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }
  static async create(
    plainPassword: string
  ): Promise<Result<Password, PasswordError>> {
    if (!plainPassword || plainPassword.trim().length === 0) {
      return Result.fail(new PasswordEmptyError(plainPassword));
    }

    if (plainPassword.length < 8) {
      return Result.fail(new PasswordTooShortError(plainPassword));
    }

    if (!/[A-Z]/.test(plainPassword)) {
      return Result.fail(new PasswordFormatError(plainPassword));
    }

    if (!/[a-z]/.test(plainPassword)) {
      return Result.fail(new PasswordFormatError(plainPassword));
    }

    if (!/[0-9]/.test(plainPassword)) {
      return Result.fail(new PasswordFormatError(plainPassword));
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(plainPassword)) {
      return Result.fail(new PasswordFormatError(plainPassword));
    }

    return Result.ok(new Password(plainPassword));
  }
  static async generateTemporary(): Promise<Password> {
    const password = randomBytes(12).toString("base64") + "Aa1!";
    const result = await Password.create(password);

    if (Result.isFailure(result)) {
      throw new Error("Failed to generate temporary password");
    }

    return result.value;
  }
}

export type PasswordError =
  | PasswordEmptyError
  | PasswordTooShortError
  | PasswordFormatError;

export class PasswordEmptyError extends DomainError {
  readonly code = "PASSWORD_EMPTY";
  constructor(password: string) {
    super("Password is required", {
      password,
    });
  }
}

export class PasswordTooShortError extends DomainError {
  readonly code = "PASSWORD_TOO_SHORT";
  constructor(password: string) {
    super("Password is too short", {
      password,
    });
  }
}

export class PasswordFormatError extends DomainError {
  readonly code = "PASSWORD_FORMAT_SHORT";
  constructor(password: string) {
    super(
      "Must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      {
        password,
      }
    );
  }
}
