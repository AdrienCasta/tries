import { OnboardHelperCommand } from "../../OnboardHelper.command.js";
import { PhoneNumberFixtures } from "@shared/__tests__/fixtures/PhoneNumberFixtures.js";
import { EmailFixtures } from "@shared/__tests__/fixtures/EmailFixtures.js";
import { PlaceOfBirthFixtures } from "@shared/__tests__/fixtures/PlaceOfBirthFixtures.js";

export class HelperCommandFixtures {
  static aValidCommand(
    overrides?: Partial<OnboardHelperCommand>
  ): OnboardHelperCommand {
    return new OnboardHelperCommand(
      overrides?.email ?? EmailFixtures.aRandomEmail(),
      overrides?.firstname ?? "John",
      overrides?.lastname ?? "Doe",
      overrides?.professions ?? [
        {
          code: "physiotherapist",
          healthId: {
            rpps: "12345678901",
          },
        },
      ],
      overrides?.birthdate ?? new Date("1995-03-26"),
      overrides?.phoneNumber ?? PhoneNumberFixtures.aRandomMobileNumber(),
      overrides?.frenchCounty ?? "44",
      overrides?.placeOfBirth ?? PlaceOfBirthFixtures.aRandomPlaceOfBirth()
    );
  }

  static withEmail(email: string): OnboardHelperCommand {
    return this.aValidCommand({ email });
  }
  static withFrenchCounty(frenchCounty: string): OnboardHelperCommand {
    return this.aValidCommand({ frenchCounty });
  }

  static withPhoneNumber(phoneNumber: string): OnboardHelperCommand {
    return this.aValidCommand({ phoneNumber });
  }

  static withProfession(
    professionCode: string,
    healthId: { rpps: string } | { adeli: string }
  ): OnboardHelperCommand {
    return this.aValidCommand({
      professions: [
        {
          code: professionCode,
          healthId: healthId,
        },
      ],
    });
  }

  static withBirthdate(birthdate: Date): OnboardHelperCommand {
    return this.aValidCommand({ birthdate });
  }
}
