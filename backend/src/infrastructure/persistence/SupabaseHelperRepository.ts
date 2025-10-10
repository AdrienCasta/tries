import { SupabaseClient } from "@supabase/supabase-js";
import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import { HelperPersistenceMapper } from "./mappers/HelperPersistenceMapper.js";
import { HelperPersistenceModel } from "./models/HelperPersistenceModel.js";
import { Result } from "@shared/infrastructure/Result.js";
import SaveHelperError from "@shared/infrastructure/SaveHelperError.js";

export class SupabaseHelperRepository implements HelperRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(helper: Helper): Promise<Result<void, SaveHelperError>> {
    const persistenceModel = HelperPersistenceMapper.toPersistence(helper);
    const { error: helperError } = await this.supabase
      .from("helpers")
      .upsert<HelperPersistenceModel>(persistenceModel);

    if (helperError) {
      return Result.fail(new SaveHelperError(helperError.message));
    }

    return Result.ok(undefined);
  }

  async findByEmail(email: string): Promise<Helper | null> {
    const { data, error } = await this.supabase
      .from("helpers")
      .select(
        `
        id,
        email,
        firstname,
        lastname,
        birthdate,
        french_county
      `
      )
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find helper by email: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return HelperPersistenceMapper.toDomain(data);
  }
}
