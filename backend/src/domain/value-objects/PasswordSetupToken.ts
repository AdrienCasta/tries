import { randomBytes } from "crypto";
import { Clock } from "../services/Clock.js";

export default class PasswordSetupToken {
  private constructor(
    private readonly tokenValue: string,
    private readonly expiresAt: Date
  ) {}

  get value(): string {
    return this.tokenValue;
  }

  get expiration(): Date {
    return this.expiresAt;
  }

  static create(
    clock: Clock,
    expirationHours: number = 48
  ): PasswordSetupToken {
    const token = randomBytes(32).toString("hex");
    const expiresAt = clock.now();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    return new PasswordSetupToken(token, expiresAt);
  }

  static fromValues(token: string, expiresAt: Date): PasswordSetupToken {
    return new PasswordSetupToken(token, expiresAt);
  }

  isExpired(clock: Clock): boolean {
    return clock.now() > this.expiresAt;
  }

  equals(other: PasswordSetupToken): boolean {
    return this.tokenValue === other.tokenValue;
  }

  toString(): string {
    return this.tokenValue;
  }
}
