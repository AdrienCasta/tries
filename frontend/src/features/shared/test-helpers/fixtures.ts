import type { OnboardHelperCommand } from "../../onboard-helper/OnboardHelper.types";

export class HelperCommandFixtures {
  static aValidCommand(
    overrides?: Partial<OnboardHelperCommand>
  ): OnboardHelperCommand {
    const professions = overrides?.professions ?? ["physiotherapist"];
    const defaultRppsNumbers: Record<string, string> = {};
    professions.forEach((profession) => {
      defaultRppsNumbers[profession] = `12345678901`;
    });

    return {
      email: overrides?.email ?? "john.doe@example.com",
      firstname: overrides?.firstname ?? "John",
      lastname: overrides?.lastname ?? "Doe",
      phoneNumber: overrides?.phoneNumber ?? "+33612345678",
      professions,
      rppsNumbers: overrides?.rppsNumbers ?? defaultRppsNumbers,
      birthdate: overrides?.birthdate ?? "1995-03-26",
      frenchCounty: overrides?.frenchCounty ?? "44",
      placeOfBirth: overrides?.placeOfBirth ?? {
        country: "FR",
        city: "Nantes",
        zipCode: "44000",
      },
      countryOfResidence: overrides?.countryOfResidence ?? "FR",
      professionalDescription:
        overrides?.professionalDescription ??
        "I have 5 years of experience as a physiotherapist working with elderly patients. I specialize in post-operative rehabilitation and mobility recovery.",
    };
  }

  static withEmail(email: string): OnboardHelperCommand {
    return this.aValidCommand({ email });
  }

  static withFirstname(firstname: string): OnboardHelperCommand {
    return this.aValidCommand({ firstname });
  }

  static withLastname(lastname: string): OnboardHelperCommand {
    return this.aValidCommand({ lastname });
  }

  static withPhoneNumber(phoneNumber: string): OnboardHelperCommand {
    return this.aValidCommand({ phoneNumber });
  }

  static withBirthdate(birthdate: string): OnboardHelperCommand {
    return this.aValidCommand({ birthdate });
  }

  static withFrenchCounty(frenchCounty: string): OnboardHelperCommand {
    return this.aValidCommand({ frenchCounty });
  }
}
