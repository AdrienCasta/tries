import { randomBytes } from "crypto";
import { Result } from "../../infrastructure/Result.js";
import ValidationError from "../../infrastructure/ValidationError.js";

export default class Password {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }
  static async create(
    plainPassword: string
  ): Promise<Result<Password, ValidationError>> {
    if (!plainPassword || plainPassword.trim().length === 0) {
      return Result.fail(new ValidationError("Password is required"));
    }

    if (plainPassword.length < 8) {
      return Result.fail(new ValidationError("Password too short"));
    }

    if (!/[A-Z]/.test(plainPassword)) {
      return Result.fail(
        new ValidationError("Password must contain uppercase")
      );
    }

    if (!/[a-z]/.test(plainPassword)) {
      return Result.fail(
        new ValidationError("Password must contain lowercase")
      );
    }

    if (!/[0-9]/.test(plainPassword)) {
      return Result.fail(new ValidationError("Password must contain number"));
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(plainPassword)) {
      return Result.fail(new ValidationError("Password must contain special"));
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
