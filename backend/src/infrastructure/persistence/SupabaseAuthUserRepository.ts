import { SupabaseClient } from "@supabase/supabase-js";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository";
import { AuthUserWrite } from "@shared/domain/entities/AuthUser";

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
        diploma: authUser.diploma,
        criminalRecordCertificate: authUser.criminalRecordCertificate,
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
}
