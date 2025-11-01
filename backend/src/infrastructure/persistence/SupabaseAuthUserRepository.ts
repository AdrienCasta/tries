import { SupabaseClient } from "@supabase/supabase-js";
import AuthUserRepository, {
  OtpVerificationError,
  OtpExpiredError,
  InvalidOtpError,
  UserNotFoundError,
  SendOtpError,
} from "@shared/domain/repositories/AuthUserRepository";
import { AuthUserRead, AuthUserWrite } from "@shared/domain/entities/AuthUser";
import { Result } from "@shared/infrastructure/Result";

export class SupabaseAuthUserRepository implements AuthUserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createUser(authUser: AuthUserWrite): Promise<void> {
    const { error } = await this.supabase.auth.admin.createUser({
      email: authUser.email,
      password: authUser.password,
      phone: authUser.phoneNumber,
      email_confirm: false,
      user_metadata: {
        firstname: authUser.firstname,
        lastname: authUser.lastname,
        birthdate: authUser.birthdate?.toISOString(),
        placeOfBirth: authUser.placeOfBirth,
        professions: authUser.professions,
        residence: authUser.residence,
        criminalRecordCertificateId: authUser.criminalRecordCertificateId,
      },
    });

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error || !data.users) {
      return false;
    }

    return data.users.some((user) => user.email === email);
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error || !data.users) {
      return false;
    }

    const normalizedSearchPhone = phoneNumber.replace(/^\+/, "");

    return data.users.some((user) => {
      if (!user.phone) return false;
      const normalizedUserPhone = user.phone.replace(/^\+/, "");
      return normalizedUserPhone === normalizedSearchPhone;
    });
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
      firstname: user.user_metadata.firstname,
      lastname: user.user_metadata.lastname,
      phoneNumber: user.phone!,
      birthdate: user.user_metadata.birthdate,
      placeOfBirth: user.user_metadata.placeOfBirth,
      professions: user.user_metadata.professions,
      residence: user.user_metadata.residence,
      emailConfirmed: !!user.email_confirmed_at,
      criminalRecordCertificateId:
        user.user_metadata.criminalRecordCertificateId,
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

  async sendOtp(
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
