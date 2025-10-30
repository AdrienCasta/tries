import type RegisterHelperCommand from "../../register-helper/RegisterHelper.types";

export class HelperCommandFixtures {
  static aValidCommand(
    overrides?: Partial<RegisterHelperCommand>
  ): RegisterHelperCommand {
    return {
      email: overrides?.email ?? "john.doe@example.com",
      password: overrides?.password ?? "12345AZERTpoiu!!!",
      firstname: overrides?.firstname ?? "John",
      lastname: overrides?.lastname ?? "Doe",
      phoneNumber: overrides?.phoneNumber ?? "+33612345678",
      birthdate: overrides?.birthdate ?? ("1995-03-26" as any),
      placeOfBirth: overrides?.placeOfBirth ?? {
        country: "FR",
        city: "Nantes",
      },
      professions: overrides?.professions ?? [
        {
          code: "physiotherapist",
          healthId: { rpps: "12345678901" },
        },
      ],
      residence: overrides?.residence ?? {
        country: "FR",
        frenchAreaCode: "44",
      },
    };
  }

  static withEmail(email: string): RegisterHelperCommand {
    return this.aValidCommand({ email });
  }

  static withFirstname(firstname: string): RegisterHelperCommand {
    return this.aValidCommand({ firstname });
  }

  static withLastname(lastname: string): RegisterHelperCommand {
    return this.aValidCommand({ lastname });
  }

  static withPhoneNumber(phoneNumber: string): RegisterHelperCommand {
    return this.aValidCommand({ phoneNumber });
  }

  static withBirthdate(birthdate: any): RegisterHelperCommand {
    return this.aValidCommand({ birthdate });
  }
}
