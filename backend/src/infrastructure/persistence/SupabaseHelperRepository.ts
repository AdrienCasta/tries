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
      birthdate: helper.birthdate.value,
    });

    if (helperError) {
      throw new Error(`Failed to save helper: ${helperError.message}`);
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
        birthdate
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
