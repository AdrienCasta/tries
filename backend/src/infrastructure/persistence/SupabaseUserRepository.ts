import { SupabaseClient } from "@supabase/supabase-js";
import UserRepository, {
  UserWrite,
  UserUpdate,
} from "@shared/domain/repositories/UserRepository.js";
import { UserProps } from "@shared/domain/entities/User.js";
import { Result } from "@shared/infrastructure/Result.js";

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(user: UserWrite): Promise<Result<void, Error>> {
    const { error } = await this.supabase.from("users").insert({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      profile_status: user.profileStatus ?? "incomplete",
    });

    if (error) {
      return Result.fail(new Error(`Failed to create user profile: ${error.message}`));
    }

    return Result.ok();
  }

  async update(user: UserUpdate): Promise<Result<void, Error>> {
    const updateData: Record<string, unknown> = {};

    if (user.firstname !== undefined) {
      updateData.firstname = user.firstname;
    }
    if (user.lastname !== undefined) {
      updateData.lastname = user.lastname;
    }
    if (user.profileStatus !== undefined) {
      updateData.profile_status = user.profileStatus;
    }

    const { data, error } = await this.supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select();

    if (error) {
      return Result.fail(new Error(`Failed to update user profile: ${error.message}`));
    }

    if (!data || data.length === 0) {
      return Result.fail(new Error(`User with id ${user.id} not found`));
    }

    return Result.ok();
  }

  async findByEmail(email: string): Promise<UserProps | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      firstname: data.firstname,
      lastname: data.lastname,
      profileStatus: data.profile_status ?? "incomplete",
    };
  }

  async findById(id: string): Promise<UserProps | null> {
    const { data, error} = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      firstname: data.firstname,
      lastname: data.lastname,
      profileStatus: data.profile_status ?? "incomplete",
    };
  }
}
