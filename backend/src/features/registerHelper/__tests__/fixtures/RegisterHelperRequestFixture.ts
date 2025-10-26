import { RegisterHelperRequest } from "@features/registerHelper/registerHelper.controller";
import { EmailFixtures } from "@shared/__tests__/fixtures/EmailFixtures";

export default class RegisterHelperCommandFixture {
  static aValidRequest(
    overrides?: Partial<RegisterHelperRequest>
  ): RegisterHelperRequest {
    return {
      email: overrides?.email ?? EmailFixtures.aRandomEmail(),
      password: overrides?.password ?? "12345AZERTpoiu!!!",
      firstname: overrides?.firstname ?? "John",
      lastname: overrides?.lastname ?? "Doe",
      phoneNumber: overrides?.phoneNumber ?? "+33612345678",
      birthdate: overrides?.birthdate ?? new Date("1990-01-01").toISOString(),
      placeOfBirth: overrides?.placeOfBirth ?? {
        country: "FR",
        city: "Paris",
      },
      professions: overrides?.professions ?? [
        {
          code: "physiotherapist",
          healthId: { rpps: "12345678901" },
          credential: {
            fileType: ".pdf",
            fileSize: 10 * 1024 * 1024,
          },
        },
      ],
      residence: overrides?.residence ?? {
        country: "FR",
        frenchAreaCode: "75",
      },
      criminalRecordCertificate: overrides?.criminalRecordCertificate || {
        fileType: ".pdf",
        fileSize: 10 * 1024 * 1024,
      },
    };
  }
}
