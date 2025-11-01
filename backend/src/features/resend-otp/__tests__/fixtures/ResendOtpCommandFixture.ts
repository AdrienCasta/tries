import ResendOtpCommand from "../../resend-otp.command";

export default class ResendOtpCommandFixture {
  static aValidCommand(overrides?: Partial<ResendOtpCommand>): ResendOtpCommand {
    return {
      email: "test@example.com",
      ...overrides,
    };
  }
}
