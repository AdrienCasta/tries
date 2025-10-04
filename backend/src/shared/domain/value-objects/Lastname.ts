import { Result } from "../../infrastructure/Result.js";
import ValidationError from "../../infrastructure/ValidationError.js";

export default class Lastname {
  readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(lastname: string): Result<Lastname, ValidationError> {
    if (!lastname || lastname.trim().length === 0) {
      return Result.fail(ValidationError.lastnameRequired());
    }
    if (lastname.trim().length < 2) {
      return Result.fail(ValidationError.lastnameTooShort());
    }
    return Result.ok(new Lastname(lastname));
  }

  toValue(): string {
    return this.value;
  }
}
