import type { OnboardHelperFormData } from "../../types/OnboardHelperForm.types";

export class HelperFormDataFixtures {
  static aValidFormData(
    overrides?: Partial<OnboardHelperFormData>
  ): OnboardHelperFormData {
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
      countryOfBirth: overrides?.countryOfBirth ?? "",
      countryOfResidence: overrides?.countryOfResidence ?? "FR",
      professionalDescription:
        overrides?.professionalDescription ??
        "I have 5 years of experience as a physiotherapist working with elderly patients. I specialize in post-operative rehabilitation and mobility recovery.",
    };
  }

  static withEmail(email: string): OnboardHelperFormData {
    return this.aValidFormData({ email });
  }

  static withFirstname(firstname: string): OnboardHelperFormData {
    return this.aValidFormData({ firstname });
  }

  static withLastname(lastname: string): OnboardHelperFormData {
    return this.aValidFormData({ lastname });
  }

  static withPhoneNumber(phoneNumber: string): OnboardHelperFormData {
    return this.aValidFormData({ phoneNumber });
  }

  static withBirthdate(birthdate: string): OnboardHelperFormData {
    return this.aValidFormData({ birthdate });
  }

  static withFrenchCounty(frenchCounty: string): OnboardHelperFormData {
    return this.aValidFormData({ frenchCounty });
  }
}
