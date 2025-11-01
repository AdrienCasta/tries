import { AuthUserRead, AuthUserWrite } from "../entities/AuthUser";
import { Result } from "../../infrastructure/Result";

export class OtpVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OtpVerificationError";
  }
}

export class OtpExpiredError extends OtpVerificationError {
  constructor() {
    super("OTP code has expired");
    this.name = "OtpExpiredError";
  }
}

export class InvalidOtpError extends OtpVerificationError {
  constructor() {
    super("Invalid OTP code");
    this.name = "InvalidOtpError";
  }
}

export class UserNotFoundError extends Error {
  constructor(email: string) {
    super(`User with email ${email} not found`);
    this.name = "UserNotFoundError";
  }
}

export class SendOtpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SendOtpError";
  }
}

export default interface AuthUserRepository {
  createUser(authUser: AuthUserWrite): Promise<void>;
  getUserByEmail(email: string): Promise<AuthUserRead | null>;
  existsByEmail(email: string): Promise<boolean>;

  verifyOtp(
    email: string,
    otpCode: string
  ): Promise<Result<void, OtpVerificationError>>;
  sendOtp(
    email: string
  ): Promise<Result<void, UserNotFoundError | SendOtpError>>;
}
