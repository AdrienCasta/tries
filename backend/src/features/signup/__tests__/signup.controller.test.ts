import { describe, it, expect, beforeEach, vi } from "vitest";
import SignupController, {
  SignupRequest,
} from "../signup.controller";
import Signup, { EmailAlreadyInUseError } from "../signup.usecase";
import { Result } from "@shared/infrastructure/Result";
import InvalidEmailError from "@shared/domain/value-objects/errors/InvalidEmailError";
import PasswordTooShortError from "@shared/domain/value-objects/errors/PasswordTooShortError";

describe("SignupController", () => {
  let controller: SignupController;
  let mockSignupUseCase: Signup;

  beforeEach(() => {
    mockSignupUseCase = {
      execute: vi.fn(),
    } as any;
    controller = new SignupController(mockSignupUseCase);
  });

  describe("Successful signup", () => {
    it("should return 201 with success message when signup succeeds", async () => {
      const request: SignupRequest = {
        email: "john@example.com",
        password: "SecurePass123!",
      };

      vi.mocked(mockSignupUseCase.execute).mockResolvedValue(Result.ok());

      const response = await controller.handle(request);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "User signed up successfully",
      });
    });
  });

  describe("Validation errors", () => {
    it("should return 400 with error details when email is invalid", async () => {
      const request: SignupRequest = {
        email: "invalid-email",
        password: "SecurePass123!",
      };

      vi.mocked(mockSignupUseCase.execute).mockResolvedValue(
        Result.fail(new InvalidEmailError())
      );

      const response = await controller.handle(request);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe("InvalidEmailError");
    });

    it("should return 400 with error details when password is too short", async () => {
      const request: SignupRequest = {
        email: "john@example.com",
        password: "short",
      };

      vi.mocked(mockSignupUseCase.execute).mockResolvedValue(
        Result.fail(new PasswordTooShortError())
      );

      const response = await controller.handle(request);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe("PasswordTooShortError");
    });
  });

  describe("Duplicate email", () => {
    it("should return 409 when email already exists", async () => {
      const request: SignupRequest = {
        email: "john@example.com",
        password: "SecurePass123!",
      };

      vi.mocked(mockSignupUseCase.execute).mockResolvedValue(
        Result.fail(new EmailAlreadyInUseError())
      );

      const response = await controller.handle(request);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("this email address is already in use.");
      expect(response.body.code).toBe("EmailAlreadyInUseError");
    });
  });
});
