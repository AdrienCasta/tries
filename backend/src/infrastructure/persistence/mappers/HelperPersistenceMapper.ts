import { Helper } from "@shared/domain/entities/Helper.js";
import { HelperPersistenceModel } from "../models/HelperPersistenceModel.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import Firstname from "@shared/domain/value-objects/Firstname.js";
import Lastname from "@shared/domain/value-objects/Lastname.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import Birthdate from "@shared/domain/value-objects/Birthdate.js";
import Residence from "@shared/domain/value-objects/Residence.js";
import Profession from "@shared/domain/value-objects/Profession.js";
import PlaceOfBirth from "@shared/domain/value-objects/PlaceOfBirth.js";
import DataMappingException from "@shared/infrastructure/DataMappingException.js";

export class HelperPersistenceMapper {
  static toPersistence(helper: Helper): HelperPersistenceModel {
    return {
      id: helper.id.value,
      first_name: helper.firstname.value,
      last_name: helper.lastname.value,
      birth_date: helper.birthdate.value,
      birth_country_code: helper.placeOfBirth.value.country,
      birth_city: helper.placeOfBirth.value.city,
      residence_country_code: helper.residence.value.country,
      residence_french_county_code: helper.residence.value.frenchAreaCode,
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
        data.residence_country_code === "FR"
          ? Residence.createFrenchResidence(data.residence_french_county_code)
          : Residence.createForeignResidence(data.residence_country_code);

      if (!residenceResult.success) {
        throw DataMappingException.forField(
          "residence",
          {
            country: data.residence_country_code,
            frenchAreaCode: data.residence_french_county_code,
          },
          residenceResult.error.message
        );
      }

      const placeOfBirthResult = PlaceOfBirth.create({
        country: data.birth_country_code,
        city: data.birth_city,
      });

      if (!placeOfBirthResult.success) {
        throw DataMappingException.forField(
          "placeOfBirth",
          { country: data.birth_country_code, city: data.birth_city },
          placeOfBirthResult.error.message
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
        placeOfBirth: placeOfBirthResult.value,
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
