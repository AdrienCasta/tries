import { SupabaseClient } from "@supabase/supabase-js";
import { ProfessionRepository } from "@shared/domain/repositories/ProfessionRepository.js";

export class SupabaseProfessionRepository implements ProfessionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("professions")
      .select("name")
      .order("name");

    if (error) {
      throw new Error(`Failed to fetch professions: ${error.message}`);
    }

    return data?.map((p) => p.name) || [];
  }

  async exists(professionName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("professions")
      .select("id")
      .eq("name", professionName)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to check profession existence: ${error.message}`
      );
    }

    return data !== null;
  }

  async findByNames(professionNames: string[]): Promise<string[]> {
    if (professionNames.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("professions")
      .select("name")
      .in("name", professionNames);

    if (error) {
      throw new Error(`Failed to find professions by names: ${error.message}`);
    }

    return data?.map((p) => p.name) || [];
  }
}
