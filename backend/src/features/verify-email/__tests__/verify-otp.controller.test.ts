import { describe, it, expect, beforeEach } from "vitest";
import VerifyOtpController, {
  VerifyOtpErrorResponse,
  VerifyOtpSuccessResponse,
} from "../verify-otp.controller";
import VerifyOtp from "../verify-otp.usecase";
import InMemoryAuthService from "@infrastructure/auth/InMemoryAuthService.js";
import InMemoryUserRepository from "@infrastructure/persistence/InMemoryUserRepository.js";

describe("VerifyOtpController", () => {
  let controller: VerifyOtpController;
  let authService: InMemoryAuthService;
  let userRepository: InMemoryUserRepository;
  let useCase: VerifyOtp;

  beforeEach(() => {
    authService = new InMemoryAuthService();
    userRepository = new InMemoryUserRepository();
    useCase = new VerifyOtp(authService, userRepository);
    controller = new VerifyOtpController(useCase);
  });

  describe("handle", () => {
    it("should return 200 on successful verification", async () => {
      const signUpResult = await authService.signUp("test@example.com");
      await userRepository.create({
        id: signUpResult.userId,
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
      });
      await authService.signInWithOtp("test@example.com");
      const otpCode = authService.getLastOtpCode("test@example.com");

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
      const signUpResult = await authService.signUp("test@example.com");
      await userRepository.create({
        id: signUpResult.userId,
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
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
      const signUpResult = await authService.signUp("test@example.com");
      await userRepository.create({
        id: signUpResult.userId,
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
      });
      await authService.signInWithOtp("test@example.com");

      const response = await controller.handle({
        email: "test@example.com",
        otpCode: "999999",
      });

      expect(response.status).toBe(400);
      expect((response.body as VerifyOtpErrorResponse).error).toBeDefined();
    });

    it("should return 410 on expired OTP", async () => {
      const signUpResult = await authService.signUp("test@example.com");
      await userRepository.create({
        id: signUpResult.userId,
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
      });
      await authService.signInWithOtp("test@example.com");
      const otpCode = authService.getLastOtpCode("test@example.com");
      authService.expireOtp("test@example.com");

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
      const signUpResult = await authService.signUp("test@example.com");
      await userRepository.create({
        id: signUpResult.userId,
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
      });
      await authService.signInWithOtp("test@example.com");

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
