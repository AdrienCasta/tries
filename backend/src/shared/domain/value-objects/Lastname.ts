import DomainError from "@shared/infrastructure/DomainError.js";
import { Result } from "../../infrastructure/Result.js";
import ValidationError from "../../infrastructure/ValidationError.js";

export default class Lastname {
  readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(
    lastname: string
  ): Result<Lastname, LastnameTooShortError | LastnameEmptyError> {
    if (!lastname || lastname.trim().length === 0) {
      return Result.fail(new LastnameEmptyError(lastname));
    }
    if (lastname.trim().length < 2) {
      return Result.fail(new LastnameTooShortError(lastname));
    }
    return Result.ok(new Lastname(lastname));
  }

  toValue(): string {
    return this.value;
  }
}

export class LastnameTooShortError extends DomainError {
  readonly code = "LASTNAME_TOO_SHORT";
  constructor(lastname: string) {
    super("Last name too short", { lastname });
  }
}

export class LastnameEmptyError extends DomainError {
  readonly code = "LASTNAME_EMPTY";
  constructor(lastname: string) {
    super("Last name is required", { lastname });
  }
}
