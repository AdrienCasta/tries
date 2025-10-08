import { Result } from "@shared/infrastructure/Result.js";
import DomainError from "@shared/infrastructure/DomainError.js";

export default class Firstname {
  readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(
    firstname: string
  ): Result<Firstname, FirstnameEmptyError | FirstnameTooShortError> {
    if (!firstname || firstname.trim().length === 0) {
      return Result.fail(new FirstnameEmptyError(firstname));
    }
    if (firstname.trim().length < 2) {
      return Result.fail(new FirstnameTooShortError(firstname));
    }
    return Result.ok(new Firstname(firstname));
  }

  toValue(): string {
    return this.value;
  }
}

export class FirstnameTooShortError extends DomainError {
  readonly code = "FIRSTNAME_TOO_SHORT";
  constructor(firstname: string) {
    super("First name too short", { firstname });
  }
}

export class FirstnameEmptyError extends DomainError {
  readonly code = "FIRSTNAME_EMPTY";
  constructor(firstname: string) {
    super("First name is required", { firstname });
  }
}
