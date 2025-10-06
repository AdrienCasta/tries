import { OnboardHelperCommand } from "../../OnboardHelper.command.js";

export class HelperCommandFixtures {
  static aValidCommand(
    overrides?: Partial<OnboardHelperCommand>
  ): OnboardHelperCommand {
    return new OnboardHelperCommand(
      overrides?.email ?? "john@example.com",
      overrides?.firstname ?? "John",
      overrides?.lastname ?? "Doe",
      overrides?.phoneNumber,
      overrides?.professions
    );
  }

  static withEmail(email: string): OnboardHelperCommand {
    return this.aValidCommand({ email });
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
}
