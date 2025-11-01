import { describe, it, expect, beforeEach } from "vitest";
import InMemoryAuthUserRepository from "../../infrastructure/persistence/InMemoryAuthUserRepository";
import { Result } from "@shared/infrastructure/Result";

describe("AuthUserRepository - OTP Operations", () => {
  let repository: InMemoryAuthUserRepository;

  beforeEach(() => {
    repository = new InMemoryAuthUserRepository();
  });

  describe("verifyOtp", () => {
    it("should verify OTP successfully for valid code", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      await repository.sendOtp("test@example.com");
      const otpCode = repository.getLastOtpCode("test@example.com");

      const result = await repository.verifyOtp("test@example.com", otpCode);

      expect(Result.isSuccess(result)).toBe(true);

      const user = await repository.getUserByEmail("test@example.com");
      expect(user?.emailConfirmed).toBe(true);
    });

    it("should fail when OTP code is invalid", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      await repository.sendOtp("test@example.com");

      const result = await repository.verifyOtp("test@example.com", "999999");

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.name).toBe("InvalidOtpError");
      }
    });

    it("should fail when OTP has expired", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      await repository.sendOtp("test@example.com");
      const otpCode = repository.getLastOtpCode("test@example.com");

      repository.expireOtp("test@example.com");

      const result = await repository.verifyOtp("test@example.com", otpCode);

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.name).toBe("OtpExpiredError");
      }
    });

    it("should fail when no OTP exists for email", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      const result = await repository.verifyOtp("test@example.com", "123456");

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.name).toBe("InvalidOtpError");
      }
    });

    it("should invalidate OTP after successful verification", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      await repository.sendOtp("test@example.com");
      const otpCode = repository.getLastOtpCode("test@example.com");

      await repository.verifyOtp("test@example.com", otpCode);
      const result = await repository.verifyOtp("test@example.com", otpCode);

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.name).toBe("InvalidOtpError");
      }
    });
  });

  describe("sendOtp", () => {
    it("should send OTP successfully for existing user", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      const result = await repository.sendOtp("test@example.com");

      expect(Result.isSuccess(result)).toBe(true);

      const otpCode = repository.getLastOtpCode("test@example.com");
      expect(otpCode).toMatch(/^\d{6}$/);
    });

    it("should fail when user does not exist", async () => {
      const result = await repository.sendOtp("nonexistent@example.com");

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.name).toBe("UserNotFoundError");
        expect(result.error.message).toContain("nonexistent@example.com");
      }
    });

    it("should generate 6-digit numeric OTP code", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      await repository.sendOtp("test@example.com");
      const otpCode = repository.getLastOtpCode("test@example.com");

      expect(otpCode).toHaveLength(6);
      expect(otpCode).toMatch(/^\d{6}$/);
    });

    it("should invalidate previous OTP when sending new one", async () => {
      await repository.createUser({
        email: "test@example.com",
        password: "Test123!",
      });

      await repository.sendOtp("test@example.com");
      const firstOtp = repository.getLastOtpCode("test@example.com");

      await repository.sendOtp("test@example.com");
      const secondOtp = repository.getLastOtpCode("test@example.com");

      const result = await repository.verifyOtp("test@example.com", firstOtp);
      expect(Result.isFailure(result)).toBe(true);

      const result2 = await repository.verifyOtp("test@example.com", secondOtp);
      expect(Result.isSuccess(result2)).toBe(true);
    });
  });
});
