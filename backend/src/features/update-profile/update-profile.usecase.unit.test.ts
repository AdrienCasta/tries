import { describe, expect, it, beforeEach } from "vitest";
import UpdateProfile, { UpdateProfileResult } from "./update-profile.usecase";
import UpdateProfileCommand from "./update-profile.command";
import InMemoryUserRepository from "@infrastructure/persistence/InMemoryUserRepository";
import { Result } from "@shared/infrastructure/Result";

class UpdateProfileTestHarness {
  private result: UpdateProfileResult | undefined;
  private readonly testUserId = "test-user-123";
  private readonly testEmail = "test@example.com";

  private constructor(
    private readonly userRepository: InMemoryUserRepository,
    private readonly useCase: UpdateProfile
  ) {}

  static async setup() {
    const userRepository = new InMemoryUserRepository();
    const useCase = new UpdateProfile(userRepository);
    const harness = new this(userRepository, useCase);
    await harness.createUnverifiedUser();
    return harness;
  }

  async createUnverifiedUser() {
    await this.userRepository.create({
      id: this.testUserId,
      email: this.testEmail,
      profileStatus: "incomplete",
    });
  }

  async updateProfile(command: UpdateProfileCommand) {
    this.result = await this.useCase.execute(command);
  }

  didUpdateSucceed() {
    return this.result ? Result.isSuccess(this.result) : false;
  }

  didUpdateFail() {
    return this.result ? Result.isFailure(this.result) : false;
  }

  getError() {
    return this.result && Result.isFailure(this.result)
      ? this.result.error.message
      : undefined;
  }

  async getUserProfile() {
    return await this.userRepository.findById(this.testUserId);
  }

  getTestUserId() {
    return this.testUserId;
  }
}

describe("Given a user wants to update their profile", () => {
  let harness: UpdateProfileTestHarness;

  beforeEach(async () => {
    harness = await UpdateProfileTestHarness.setup();
  });

  describe("When the user provides valid firstname and lastname", () => {
    it("Then the profile should be updated successfully", async () => {
      await harness.updateProfile({
        userId: harness.getTestUserId(),
        firstname: "John",
        lastname: "Doe",
      });

      expect(harness.didUpdateSucceed()).toBe(true);
    });

    it("Then profileStatus should be set to completed", async () => {
      await harness.updateProfile({
        userId: harness.getTestUserId(),
        firstname: "John",
        lastname: "Doe",
      });

      const user = await harness.getUserProfile();
      expect(user?.profileStatus).toBe("completed");
    });

    it("Then the firstname should be stored in the database", async () => {
      await harness.updateProfile({
        userId: harness.getTestUserId(),
        firstname: "John",
        lastname: "Doe",
      });

      const user = await harness.getUserProfile();
      expect(user?.firstname).toBe("John");
    });

    it("Then the lastname should be stored in the database", async () => {
      await harness.updateProfile({
        userId: harness.getTestUserId(),
        firstname: "John",
        lastname: "Doe",
      });

      const user = await harness.getUserProfile();
      expect(user?.lastname).toBe("Doe");
    });
  });

  describe("When the user does not exist", () => {
    it("Then the update should fail", async () => {
      await harness.updateProfile({
        userId: "non-existent-user",
        firstname: "John",
        lastname: "Doe",
      });

      expect(harness.didUpdateFail()).toBe(true);
    });

    it("Then an error message should indicate user not found", async () => {
      await harness.updateProfile({
        userId: "non-existent-user",
        firstname: "John",
        lastname: "Doe",
      });

      expect(harness.getError()).toContain("not found");
    });
  });

  describe("When the firstname is invalid", () => {
    it("Then the update should fail with empty firstname", async () => {
      await harness.updateProfile({
        userId: harness.getTestUserId(),
        firstname: "",
        lastname: "Doe",
      });

      expect(harness.didUpdateFail()).toBe(true);
    });
  });

  describe("When the lastname is invalid", () => {
    it("Then the update should fail with empty lastname", async () => {
      await harness.updateProfile({
        userId: harness.getTestUserId(),
        firstname: "John",
        lastname: "",
      });

      expect(harness.didUpdateFail()).toBe(true);
    });
  });
});
