import { SupabaseClient } from "@supabase/supabase-js";
import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import Firstname from "@shared/domain/value-objects/Firstname.js";
import Lastname from "@shared/domain/value-objects/Lastname.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import Profession from "@shared/domain/value-objects/Profession.js";
import DataMappingException from "@shared/infrastructure/DataMappingException.js";

export class SupabaseHelperRepository implements HelperRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(helper: Helper): Promise<void> {
    // Use a transaction to ensure atomicity
    const { error: helperError } = await this.supabase.from("helpers").upsert({
      id: helper.id.value,
      email: helper.email.value,
      firstname: helper.firstname.value,
      lastname: helper.lastname.value,
    });

    if (helperError) {
      throw new Error(`Failed to save helper: ${helperError.message}`);
    }

    // Delete existing professions for this helper
    const { error: deleteError } = await this.supabase
      .from("helper_professions")
      .delete()
      .eq("helper_id", helper.id.value);

    if (deleteError) {
      throw new Error(
        `Failed to delete existing professions: ${deleteError.message}`
      );
    }

    // Insert new professions if any
    if (helper.professions.length > 0) {
      // First, get profession IDs from profession names
      const professionNames = helper.professions.map((p) => p.value);
      const { data: professionData, error: professionFetchError } =
        await this.supabase
          .from("professions")
          .select("id, name")
          .in("name", professionNames);

      if (professionFetchError) {
        throw new Error(
          `Failed to fetch profession IDs: ${professionFetchError.message}`
        );
      }

      if (!professionData || professionData.length === 0) {
        throw new Error("No matching professions found in database");
      }

      // Create helper_professions records
      const helperProfessions = professionData.map((p) => ({
        helper_id: helper.id.value,
        profession_id: p.id,
      }));

      const { error: insertError } = await this.supabase
        .from("helper_professions")
        .insert(helperProfessions);

      if (insertError) {
        throw new Error(
          `Failed to insert helper professions: ${insertError.message}`
        );
      }
    }
  }

  async findByEmail(email: string): Promise<Helper | null> {
    // Fetch helper with professions using JOIN
    const { data, error } = await this.supabase
      .from("helpers")
      .select(
        `
        id,
        email,
        firstname,
        lastname,
        helper_professions (
          professions (
            name
          )
        )
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

    return this.mapToHelper(data);
  }

  private mapToHelper(data: any): Helper {
    try {
      const emailResult = HelperEmail.create(data.email);
      if (!emailResult.success) {
        throw DataMappingException.forField(
          "email",
          data.email,
          emailResult.error.message
        );
      }

      const firstnameResult = Firstname.create(data.firstname);
      if (!firstnameResult.success) {
        throw DataMappingException.forField(
          "firstname",
          data.firstname,
          firstnameResult.error.message
        );
      }

      const lastnameResult = Lastname.create(data.lastname);
      if (!lastnameResult.success) {
        throw DataMappingException.forField(
          "lastname",
          data.lastname,
          lastnameResult.error.message
        );
      }

      // Extract profession names from the JOIN result
      const professionNames: string[] = data.helper_professions
        ? data.helper_professions
            .map((hp: any) => hp.professions?.name)
            .filter((name: string | undefined) => name !== undefined)
        : [];

      const professionsResult = Profession.createMany(professionNames);
      if (!professionsResult.success) {
        throw DataMappingException.forField(
          "professions",
          professionNames,
          professionsResult.error.message
        );
      }

      return {
        id: HelperId.create(data.id),
        email: emailResult.value,
        firstname: firstnameResult.value,
        lastname: lastnameResult.value,
        professions: professionsResult.value,
      };
    } catch (error) {
      if (error instanceof DataMappingException) {
        throw error;
      }
      throw DataMappingException.forRecord(
        data.id || "unknown",
        error as Error
      );
    }
  }
}
