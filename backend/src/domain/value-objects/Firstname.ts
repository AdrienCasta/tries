import { Result } from "../../shared/Result.js";
import ValidationError from "../errors/ValidationError.js";

export default class Firstname {
  readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(firstname: string): Result<Firstname, ValidationError> {
    if (!firstname || firstname.trim().length === 0) {
      return Result.fail(ValidationError.firstnameRequired());
    }
    if (firstname.trim().length < 2) {
      return Result.fail(ValidationError.firstnameTooShort());
    }
    return Result.ok(new Firstname(firstname));
  }

  toValue(): string {
    return this.value;
  }
}
