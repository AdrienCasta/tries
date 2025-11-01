import VerifyOtpCommand from "../../verify-otp.command";

export default class VerifyOtpCommandFixture {
  static aValidCommand(overrides?: Partial<VerifyOtpCommand>): VerifyOtpCommand {
    return {
      email: "test@example.com",
      otpCode: "123456",
      ...overrides,
    };
  }
}
