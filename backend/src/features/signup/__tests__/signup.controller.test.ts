import { describe, it, expect, beforeEach, vi } from "vitest";
import SignupController, {
  SignupErrorResponse,
  SignupRequest,
} from "../signup.controller";
import Signup from "../signup.usecase";

import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";

describe("SignupController", () => {
  let controller: SignupController;

  beforeEach(() => {
    controller = new SignupController(
      new Signup(new InMemoryAuthUserRepository())
    );
  });

  describe("Successful signup", () => {
    it("should return 201 with success message when signup succeeds", async () => {
      const request: SignupRequest = {
        email: "john@example.com",
        password: "SecurePass123!",
      };

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

      const response = await controller.handle(request);

      expect(response.status).toBe(400);
      expect((response.body as SignupErrorResponse).error).toBeDefined();
      expect((response.body as SignupErrorResponse).code).toBe(
        "InvalidEmailError"
      );
    });

    it("should return 400 with error details when password is too short", async () => {
      const request: SignupRequest = {
        email: "john@example.com",
        password: "short",
      };

      const response = await controller.handle(request);

      expect(response.status).toBe(400);
      expect((response.body as SignupErrorResponse).error).toBeDefined();
      expect((response.body as SignupErrorResponse).code).toBe(
        "PasswordTooShortError"
      );
    });
  });

  describe("Duplicate email", () => {
    it("should return 409 when email already exists", async () => {
      const request: SignupRequest = {
        email: "john@example.com",
        password: "SecurePass123!",
      };

      await controller.handle(request);
      const response = await controller.handle(request);

      expect(response.status).toBe(409);
      expect((response.body as SignupErrorResponse).error).toBe(
        "this email address is already in use."
      );
      expect((response.body as SignupErrorResponse).code).toBe(
        "EmailAlreadyInUseError"
      );
    });
  });
});
