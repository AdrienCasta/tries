import { SupabaseClient } from "@supabase/supabase-js";
import AuthService, {
  OtpVerificationError,
  OtpExpiredError,
  InvalidOtpError,
  UserNotFoundError,
  SendOtpError,
  SignUpResult,
} from "@shared/domain/services/AuthService";
import { AuthUserRead } from "@shared/domain/entities/AuthUser";
import { Result } from "@shared/infrastructure/Result";

export class SupabaseAuthService implements AuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  async signUp(email: string): Promise<SignUpResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password: crypto.randomUUID(),
      options: {
        emailRedirectTo: undefined,
      },
    });

    if (error || !data.user) {
      throw new Error(`Failed to sign up user: ${error?.message}`);
    }

    return {
      userId: data.user.id,
      email: data.user.email!,
    };
  }

  async existsByEmail(email: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error || !data.users) {
      return false;
    }

    return data.users.some((user) => user.email === email);
  }

  async getUserByEmail(email: string): Promise<AuthUserRead | null> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error || !data.users) {
      return null;
    }

    const user = data.users.find((u) => u.email === email);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      emailConfirmed: !!user.email_confirmed_at,
    };
  }

  async verifyOtp(
    email: string,
    otpCode: string
  ): Promise<Result<void, OtpVerificationError>> {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });

    if (error) {
      if (error.code === "otp_expired") {
        return Result.fail(new OtpExpiredError());
      }
      if (
        error.code === "otp_invalid" ||
        error.message.toLowerCase().includes("invalid")
      ) {
        return Result.fail(new InvalidOtpError());
      }
      return Result.fail(new OtpVerificationError(error.message));
    }

    if (!data.user) {
      return Result.fail(
        new OtpVerificationError("Verification failed: no user returned")
      );
    }

    return Result.ok();
  }

  async signInWithOtp(
    email: string
  ): Promise<Result<void, UserNotFoundError | SendOtpError>> {
    const userExists = await this.existsByEmail(email);
    if (!userExists) {
      return Result.fail(new UserNotFoundError(email));
    }

    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      if (
        error.code === "user_not_found" ||
        error.message.toLowerCase().includes("not found")
      ) {
        return Result.fail(new UserNotFoundError(email));
      }
      return Result.fail(new SendOtpError(error.message));
    }

    return Result.ok();
  }
}
