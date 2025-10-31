import SignupCommand from "../../signup.command";

export default class SignupCommandFixture {
  static aValidCommand(overrides?: Partial<SignupCommand>): SignupCommand {
    return {
      email: "john.doe@example.com",
      password: "SecurePass123!",
      ...overrides,
    };
  }
}
