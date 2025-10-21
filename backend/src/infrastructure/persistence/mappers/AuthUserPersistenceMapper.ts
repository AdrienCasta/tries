import { AuthUser } from "@shared/domain/entities/AuthUser.js";
import {
  HelperAccountWriteModel,
  HelperAccountReadModel,
} from "../models/HelperAccountPersistenceModel.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import PhoneNumber from "@shared/domain/value-objects/PhoneNumber.js";
import DataMappingException from "@shared/infrastructure/DataMappingException.js";

export class AuthUserPersistenceMapper {
  static toPersistence(account: AuthUser): HelperAccountWriteModel {
    return {
      email: account.email.value,
      phone: account.phoneNumber?.value,
    };
  }

  static toDomain(data: HelperAccountReadModel): AuthUser {
    try {
      const emailResult = HelperEmail.create(data.email);
      if (!emailResult.success) {
        throw DataMappingException.forField(
          "email",
          data.email,
          emailResult.error.message
        );
      }

      let phoneNumber: PhoneNumber | null = null;
      if (data.phone) {
        const normalizedPhone = data.phone.startsWith("+")
          ? data.phone
          : `+${data.phone}`;
        const phoneResult = PhoneNumber.create(normalizedPhone);
        if (!phoneResult.success) {
          throw DataMappingException.forField(
            "phone",
            data.phone,
            phoneResult.error.message
          );
        }
        phoneNumber = phoneResult.value;
      }

      return {
        helperId: HelperId.create(data.id),
        email: emailResult.value,
        phoneNumber,
        createdAt: new Date(data.created_at),
        lastLoginAt: data.last_sign_in_at
          ? new Date(data.last_sign_in_at)
          : undefined,
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
