import { AuthUserRead, AuthUserWrite } from "@shared/domain/entities/AuthUser";
import AuthUserRepository, {
  OtpVerificationError,
  InvalidOtpError,
  OtpExpiredError,
  UserNotFoundError,
  SendOtpError,
} from "@shared/domain/repositories/AuthUserRepository";
import { Result } from "@shared/infrastructure/Result";
import crypto from "node:crypto";

interface StoredOtp {
  code: string;
  expiresAt: Date;
}

export default class InMemoryAuthUserRepository implements AuthUserRepository {
  authUsers: Map<string, AuthUserRead> = new Map();
  private otpStore: Map<string, StoredOtp> = new Map();

  async createUser(authUser: AuthUserWrite): Promise<void> {
    this.authUsers.set(authUser.email, {
      ...authUser,
      id: crypto.randomUUID(),
      emailConfirmed: false,
    });
  }

  async getUserByEmail(email: string): Promise<AuthUserRead | null> {
    return this.authUsers.get(email) || null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.authUsers.has(email);
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    for (const user of this.authUsers.values()) {
      if (user.phoneNumber === phoneNumber) {
        return true;
      }
    }
    return false;
  }

  async verifyOtp(
    email: string,
    otpCode: string
  ): Promise<Result<void, OtpVerificationError>> {
    const storedOtp = this.otpStore.get(email);

    if (!storedOtp) {
      return Result.fail(new InvalidOtpError());
    }

    if (new Date() > storedOtp.expiresAt) {
      this.otpStore.delete(email);
      return Result.fail(new OtpExpiredError());
    }

    if (storedOtp.code !== otpCode) {
      return Result.fail(new InvalidOtpError());
    }

    this.otpStore.delete(email);
    const user = this.authUsers.get(email);
    if (user) {
      this.authUsers.set(email, { ...user, emailConfirmed: true });
    }

    return Result.ok();
  }

  async sendOtp(
    email: string
  ): Promise<Result<void, UserNotFoundError | SendOtpError>> {
    const userExists = await this.existsByEmail(email);
    if (!userExists) {
      return Result.fail(new UserNotFoundError(email));
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    this.otpStore.set(email, { code: otpCode, expiresAt });

    return Result.ok();
  }

  getLastOtpCode(email: string): string {
    const storedOtp = this.otpStore.get(email);
    return storedOtp?.code || "";
  }

  expireOtp(email: string): void {
    const storedOtp = this.otpStore.get(email);
    if (storedOtp) {
      storedOtp.expiresAt = new Date(Date.now() - 1000);
    }
  }
}
