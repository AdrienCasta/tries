import bcrypt from "bcryptjs";
import { Result } from "../../shared/Result.js";
import ValidationError from "../errors/ValidationError.js";

export default class Password {
  private constructor(private readonly hashedValue: string) {}

  get hash(): string {
    return this.hashedValue;
  }

  static async create(plainPassword: string): Promise<Result<Password, ValidationError>> {
    if (!plainPassword || plainPassword.trim().length === 0) {
      return Result.fail(new ValidationError("Password is required"));
    }

    if (plainPassword.length < 8) {
      return Result.fail(new ValidationError("Password too short"));
    }

    if (!/[A-Z]/.test(plainPassword)) {
      return Result.fail(new ValidationError("Password must contain uppercase"));
    }

    if (!/[a-z]/.test(plainPassword)) {
      return Result.fail(new ValidationError("Password must contain lowercase"));
    }

    if (!/[0-9]/.test(plainPassword)) {
      return Result.fail(new ValidationError("Password must contain number"));
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(plainPassword)) {
      return Result.fail(new ValidationError("Password must contain special"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    return Result.ok(new Password(hashedPassword));
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.hashedValue);
  }
}
