import { OnboardHelperCommand } from "../../OnboardHelper.command.js";

export class HelperCommandFixtures {
  static aValidCommand(
    overrides?: Partial<OnboardHelperCommand>
  ): OnboardHelperCommand {
    return new OnboardHelperCommand(
      overrides?.email ?? "john@example.com",
      overrides?.firstname ?? "John",
      overrides?.lastname ?? "Doe",
      overrides?.professions ?? ["physiotherapist"],
      overrides?.birthdate ?? new Date("1995-03-26"),
      overrides?.phoneNumber ?? "+3312345678",
      overrides?.frenchCounty ?? "44"
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

  static withProfession(profession: string): OnboardHelperCommand {
    return this.aValidCommand({ professions: [profession] });
  }

  static withProfessions(professions: string[]): OnboardHelperCommand {
    return this.aValidCommand({ professions });
  }

  static withBirthdate(birthdate: Date): OnboardHelperCommand {
    return this.aValidCommand({ birthdate });
  }
}
