import { describe, it, expect, beforeEach } from "vitest";
import VerifyOtpController, {
  VerifyOtpErrorResponse,
  VerifyOtpSuccessResponse,
} from "../verify-otp.controller";
import VerifyOtp from "../verify-otp.usecase";
import InMemoryAuthService from "@infrastructure/auth/InMemoryAuthService.js";

describe("VerifyOtpController", () => {
  let controller: VerifyOtpController;
  let service: InMemoryAuthService;
  let useCase: VerifyOtp;

  beforeEach(() => {
    service = new InMemoryAuthService();
    useCase = new VerifyOtp(service);
    controller = new VerifyOtpController(useCase);
  });

  describe("handle", () => {
    it("should return 200 on successful verification", async () => {
      await service.signUp(
        email: "test@example.com",
        
      });
      await service.signInWithOtp("test@example.com");
      const otpCode = service.getLastOtpCode("test@example.com");

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
      await service.signUp(
        email: "test@example.com",
        
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
      await service.signUp(
        email: "test@example.com",
        
      });
      await service.signInWithOtp("test@example.com");

      const response = await controller.handle({
        email: "test@example.com",
        otpCode: "999999",
      });

      expect(response.status).toBe(400);
      expect((response.body as VerifyOtpErrorResponse).error).toBeDefined();
    });

    it("should return 410 on expired OTP", async () => {
      await service.signUp(
        email: "test@example.com",
        
      });
      await service.signInWithOtp("test@example.com");
      const otpCode = service.getLastOtpCode("test@example.com");
      service.expireOtp("test@example.com");

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
      await service.signUp(
        email: "test@example.com",
        
      });
      await service.signInWithOtp("test@example.com");

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
