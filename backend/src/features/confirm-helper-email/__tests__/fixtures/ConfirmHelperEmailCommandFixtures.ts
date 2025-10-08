import { ConfirmHelperEmailCommand } from "../../ConfirmHelperEmail.command.js";

export class ConfirmHelperEmailCommandFixtures {
  static aValidCommand(
    overrides?: Partial<ConfirmHelperEmailCommand>
  ): ConfirmHelperEmailCommand {
    return new ConfirmHelperEmailCommand(
      overrides?.token ?? "valid-token-abc123def456"
    );
  }

  static withToken(token: string): ConfirmHelperEmailCommand {
    return this.aValidCommand({ token });
  }
}
