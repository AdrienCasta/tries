import { SupabaseClient } from "@supabase/supabase-js";
import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import Firstname from "@shared/domain/value-objects/Firstname.js";
import Lastname from "@shared/domain/value-objects/Lastname.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import DataMappingException from "@shared/infrastructure/DataMappingException.js";

export class SupabaseHelperRepository implements HelperRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(helper: Helper): Promise<void> {
    const { error } = await this.supabase.from("helpers").upsert({
      id: helper.id.value,
      email: helper.email.value,
      firstname: helper.firstname.value,
      lastname: helper.lastname.value,
    });

    if (error) {
      throw new Error(`Failed to save helper: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<Helper | null> {
    const { data, error } = await this.supabase
      .from("helpers")
      .select("*")
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

      return {
        id: HelperId.create(data.id),
        email: emailResult.value,
        firstname: firstnameResult.value,
        lastname: lastnameResult.value,
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
