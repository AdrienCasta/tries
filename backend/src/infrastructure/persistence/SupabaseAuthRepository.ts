import { SupabaseClient } from "@supabase/supabase-js";
import { AuthUser } from "@shared/domain/entities/AuthUser.js";
import { AuthRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { Result } from "@shared/infrastructure/Result.js";
import InviteAuthUserException from "@shared/infrastructure/InviteAuthUserException.js";
import { AuthUserPersistenceMapper } from "./mappers/AuthUserPersistenceMapper.js";
import EmailAlreadyUsedError from "@shared/infrastructure/EmailAlreadyUsedError.js";
import PhoneAlreadyUsedError from "@shared/infrastructure/PhoneAlreadyUsedError.js";

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async inviteUser(
    authUser: AuthUser
  ): Promise<
    Result<
      AuthUser,
      InviteAuthUserException | EmailAlreadyUsedError | PhoneAlreadyUsedError
    >
  > {
    const { error } = await this.supabase.auth.admin.createUser({
      id: authUser.helperId.value,
      email: authUser.email.value,
      password: authUser.password.value,
      phone: authUser.phoneNumber?.value,
      email_confirm: false,
      user_metadata: {
        role: "invited_user",
        invited_by: "admin",
      },
    });

    if (error) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("email") &&
        (errorMessage.includes("already") || errorMessage.includes("exists"))
      ) {
        return Result.fail(new EmailAlreadyUsedError(authUser.email.value));
      }

      if (
        errorMessage.includes("phone") &&
        (errorMessage.includes("already") || errorMessage.includes("exists"))
      ) {
        return Result.fail(
          new PhoneAlreadyUsedError(authUser.phoneNumber?.value || "")
        );
      }

      return Result.fail(new InviteAuthUserException(error.message));
    }

    return Result.ok(authUser);
  }

  async delete(helperId: HelperId): Promise<void> {
    await this.supabase.auth.admin.deleteUser(helperId.value);
  }

  async findByHelperId(): Promise<AuthUser | null> {
    return Promise.resolve(null);
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error || !data.users) {
      return null;
    }

    const user = data.users.find((u) => u.email === email);
    if (!user) {
      return null;
    }

    return AuthUserPersistenceMapper.toDomain(user as any);
  }

  async findByPhone(phoneNumber: string): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error || !data.users) {
      return null;
    }

    const normalizedSearchPhone = phoneNumber.replace(/^\+/, "");

    const user = data.users.find((u) => {
      if (!u.phone) return false;
      const normalizedUserPhone = u.phone.replace(/^\+/, "");
      return normalizedUserPhone === normalizedSearchPhone;
    });

    if (!user) {
      return null;
    }

    return AuthUserPersistenceMapper.toDomain(user as any);
  }
}
