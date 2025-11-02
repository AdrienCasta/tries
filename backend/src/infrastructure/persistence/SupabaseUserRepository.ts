import { SupabaseClient } from "@supabase/supabase-js";
import UserRepository, {
  UserWrite,
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
    });

    if (error) {
      return Result.fail(new Error(`Failed to create user profile: ${error.message}`));
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
    };
  }
}
