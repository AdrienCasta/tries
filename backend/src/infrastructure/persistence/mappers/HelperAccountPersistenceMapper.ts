import { HelperAccount } from "@shared/domain/entities/HelperAccount.js";
import {
  HelperAccountWriteModel,
  HelperAccountReadModel,
} from "../models/HelperAccountPersistenceModel.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import HelperEmail from "@shared/domain/value-objects/HelperEmail.js";
import PhoneNumber from "@shared/domain/value-objects/PhoneNumber.js";
import DataMappingException from "@shared/infrastructure/DataMappingException.js";

export class HelperAccountPersistenceMapper {
  static toPersistence(account: HelperAccount): HelperAccountWriteModel {
    return {
      email: account.email.value,
      password: account.password?.value,
      phone: account.phoneNumber?.value,
      email_confirm: false,
    };
  }

  static toDomain(data: HelperAccountReadModel): HelperAccount {
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
        const phoneResult = PhoneNumber.create(data.phone);
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
