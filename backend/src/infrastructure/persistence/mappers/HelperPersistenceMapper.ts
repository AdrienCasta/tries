import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperPersistenceModel } from "../models/HelperPersistenceModel.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import Firstname from "@shared/domain/value-objects/Firstname.js";
import Lastname from "@shared/domain/value-objects/Lastname.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import Birthdate from "@shared/domain/value-objects/Birthdate.js";
import Residence from "@shared/domain/value-objects/Residence.js";
import Profession from "@shared/domain/value-objects/Profession.js";
import DataMappingException from "@shared/infrastructure/DataMappingException.js";

export class HelperPersistenceMapper {
  static toPersistence(helper: Helper): HelperPersistenceModel {
    return {
      id: helper.id.value,
      email: helper.email.value,
      firstname: helper.firstname.value,
      lastname: helper.lastname.value,
      birthdate: helper.birthdate.value,
      country: helper.residence.value.country,
      french_county: helper.residence.value.frenchCounty,
    };
  }

  static toDomain(data: any): Helper {
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

      const birthdateResult = Birthdate.create(new Date(data.birthdate));
      if (!birthdateResult.success) {
        throw DataMappingException.forField(
          "birthdate",
          data.birthdate,
          birthdateResult.error.message
        );
      }

      const residenceResult =
        data.country === "France"
          ? Residence.createFrenchResidence(data.french_county)
          : Residence.createForeignResidence(data.country);

      if (!residenceResult.success) {
        throw DataMappingException.forField(
          "residence",
          { country: data.country, french_county: data.french_county },
          residenceResult.error.message
        );
      }

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
        birthdate: birthdateResult.value,
        residence: residenceResult.value,
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
