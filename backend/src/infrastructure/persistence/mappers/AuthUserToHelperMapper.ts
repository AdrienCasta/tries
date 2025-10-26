import { AuthUserRead } from "@shared/domain/entities/AuthUser.js";
import { HelperProps } from "@shared/domain/entities/Helper.js";
import { Result } from "@shared/infrastructure/Result.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import Lastname from "@shared/domain/value-objects/Lastname.js";
import Firstname from "@shared/domain/value-objects/Firstname.js";
import Birthdate from "@shared/domain/value-objects/Birthdate.js";
import Residence from "@shared/domain/value-objects/Residence.js";
import PlaceOfBirth from "@shared/domain/value-objects/PlaceOfBirth.js";
import Profession, {
  ProfessionWithHealthId,
} from "@shared/domain/value-objects/Profession.js";

export class AuthUserToHelperMapper {
  static toHelperProps(authUser: AuthUserRead): Result<HelperProps, Error> {
    return Result.combineObject({
      id: Result.ok(HelperId.create(authUser.id)),
      email: HelperEmail.create(authUser.email),
      lastname: Lastname.create(authUser.lastname),
      firstname: Firstname.create(authUser.firstname),
      birthdate: Birthdate.create(new Date(authUser.birthdate)),
      residence:
        authUser.residence.country === "FR"
          ? Residence.createFrenchResidence(
              authUser.residence.frenchAreaCode as string
            )
          : Residence.createForeignResidence(authUser.residence.country),
      placeOfBirth: PlaceOfBirth.create(authUser.placeOfBirth),
      professions: Profession.createMany(
        authUser.professions.map((p) => p as ProfessionWithHealthId)
      ),
    });
  }
}
