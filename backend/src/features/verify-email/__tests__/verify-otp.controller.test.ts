import { describe, it, expect, beforeEach } from "vitest";
import VerifyOtpController, {
  VerifyOtpErrorResponse,
  VerifyOtpSuccessResponse,
} from "../verify-otp.controller";
import VerifyOtp from "../verify-otp.usecase";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";

describe("VerifyOtpController", () => {
  let controller: VerifyOtpController;
  let repository: InMemoryAuthUserRepository;
  let useCase: VerifyOtp;

  beforeEach(() => {
    repository = new InMemoryAuthUserRepository();
    useCase = new VerifyOtp(repository);
    controller = new VerifyOtpController(useCase);
  });

  describe("handle", () => {
    it("should return 200 on successful verification", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });
      await repository.sendOtp("test@example.com");
      const otpCode = repository.getLastOtpCode("test@example.com");

      const response = await controller.handle({
        email: "test@example.com",
        otpCode,
      });

      expect(response.status).toBe(200);
      expect((response.body as VerifyOtpSuccessResponse).message).toContain(
        "verified"
      );
    });

    it("should return 400 on invalid OTP format", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      const response = await controller.handle({
        email: "test@example.com",
        otpCode: "12345",
      });

      expect(response.status).toBe(400);
      expect((response.body as VerifyOtpErrorResponse).error).toBeDefined();
      expect((response.body as VerifyOtpErrorResponse).error).toContain(
        "6 digits"
      );
    });

    it("should return 400 on invalid OTP code", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });
      await repository.sendOtp("test@example.com");

      const response = await controller.handle({
        email: "test@example.com",
        otpCode: "999999",
      });

      expect(response.status).toBe(400);
      expect((response.body as VerifyOtpErrorResponse).error).toBeDefined();
    });

    it("should return 410 on expired OTP", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });
      await repository.sendOtp("test@example.com");
      const otpCode = repository.getLastOtpCode("test@example.com");
      repository.expireOtp("test@example.com");

      const response = await controller.handle({
        email: "test@example.com",
        otpCode,
      });

      expect(response.status).toBe(410);
      expect((response.body as VerifyOtpErrorResponse).error).toContain(
        "expired"
      );
    });

    it("should return 400 on invalid email format", async () => {
      const response = await controller.handle({
        email: "invalid-email",
        otpCode: "123456",
      });

      expect(response.status).toBe(400);
      expect((response.body as VerifyOtpErrorResponse).error).toBeDefined();
    });

    it("should include error code in response", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });
      await repository.sendOtp("test@example.com");

      const response = await controller.handle({
        email: "test@example.com",
        otpCode: "999999",
      });

      expect(response.status).toBe(400);
      expect((response.body as VerifyOtpErrorResponse).code).toBe(
        "InvalidOtpError"
      );
    });
  });
});
