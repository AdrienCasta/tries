import { randomBytes } from "crypto";

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

  static create(expirationHours: number = 48): PasswordSetupToken {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    return new PasswordSetupToken(token, expiresAt);
  }

  static fromValues(token: string, expiresAt: Date): PasswordSetupToken {
    return new PasswordSetupToken(token, expiresAt);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  equals(other: PasswordSetupToken): boolean {
    return this.tokenValue === other.tokenValue;
  }

  toString(): string {
    return this.tokenValue;
  }
}
