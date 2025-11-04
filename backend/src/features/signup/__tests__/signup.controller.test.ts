import { describe, it, expect, beforeEach } from "vitest";
import SignupController, {
  SignupErrorResponse,
  SignupRequest,
} from "../signup.controller";
import Signup from "../signup.usecase";

import InMemoryAuthService from "@infrastructure/auth/InMemoryAuthService.js";

describe("SignupController", () => {
  let controller: SignupController;

  beforeEach(() => {
    controller = new SignupController(
      new Signup(new InMemoryAuthService())
    );
  });

  describe("Successful signup", () => {
    it("should return 201 with success message when signup succeeds", async () => {
      const request: SignupRequest = {
        email: "john@example.com",
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
      };

      const response = await controller.handle(request);

      expect(response.status).toBe(400);
      expect((response.body as SignupErrorResponse).error).toBeDefined();
      expect((response.body as SignupErrorResponse).code).toBe(
        "InvalidEmailError"
      );
    });
  });

  describe("Duplicate email", () => {
    it("should return 409 when email already exists", async () => {
      const request: SignupRequest = {
        email: "john@example.com",
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
