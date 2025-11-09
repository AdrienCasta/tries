import { describe, expect, test, beforeEach } from "vitest";
import type { ProfileCompletionCommand } from "./ProfileCompletion.schema";
import type { AppDispatch, RootState } from "@/store";
import { configureStore, type Store } from "@reduxjs/toolkit";
import profileCompletionReducer from "./ProfileCompletion.slice";
import {
  completeProfile,
  type ProfileRepository,
} from "./profile-completion.usecase";
import { Result } from "@/shared/infrastructure/Result";
import type { Result as ResultType } from "@/shared/infrastructure/Result";

type TestStore = Store<RootState> & { dispatch: AppDispatch };

const TEST_USER_ID = "1";
const TEST_COMMAND: ProfileCompletionCommand = {
  firstname: "Adrien",
};

function createTestStore(): TestStore {
  return configureStore({
    reducer: {
      profileCompletion: profileCompletionReducer,
    },
  }) as TestStore;
}

describe("Profile Completion Use Case", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  describe("Initial state", () => {
    test("status should be idle", () => {
      expect(store.getState().profileCompletion.status).toBe("idle");
    });

    test("error should be undefined", () => {
      expect(store.getState().profileCompletion.error).toBeUndefined();
    });
  });

  describe("When completing profile", () => {
    test("status should be started while request is in progress", async () => {
      const completingProfile = completeProfile(
        new FakeSlowProfileRepository(),
        store.dispatch
      ).execute(TEST_USER_ID, TEST_COMMAND);

      expect(store.getState().profileCompletion.status).toBe("started");

      await completingProfile;
    });

    test("error should be undefined while request is in progress", async () => {
      const completingProfile = completeProfile(
        new FakeSlowProfileRepository(),
        store.dispatch
      ).execute(TEST_USER_ID, TEST_COMMAND);

      expect(store.getState().profileCompletion.error).toBeUndefined();

      await completingProfile;
    });
  });

  describe("When profile update fails", () => {
    test("status should be failed", async () => {
      await completeProfile(
        new FakeFailedProfileRepository(),
        store.dispatch
      ).execute(TEST_USER_ID, TEST_COMMAND);

      expect(store.getState().profileCompletion.status).toBe("failed");
    });

    test("error message should be set", async () => {
      await completeProfile(
        new FakeFailedProfileRepository(),
        store.dispatch
      ).execute(TEST_USER_ID, TEST_COMMAND);

      expect(store.getState().profileCompletion.error).toBe(
        "Fail completing profile"
      );
    });
  });

  describe("When profile update succeeds", () => {
    test("status should be success", async () => {
      await completeProfile(
        new FakeSuccessProfileRepository(),
        store.dispatch
      ).execute(TEST_USER_ID, TEST_COMMAND);

      expect(store.getState().profileCompletion.status).toBe("success");
    });

    test("error should be undefined", async () => {
      await completeProfile(
        new FakeSuccessProfileRepository(),
        store.dispatch
      ).execute(TEST_USER_ID, TEST_COMMAND);

      expect(store.getState().profileCompletion.error).toBeUndefined();
    });
  });
});

class FakeFailedProfileRepository implements ProfileRepository {
  async update(): Promise<ResultType<void, Error>> {
    return Result.fail(new Error("Fail completing profile"));
  }
}

class FakeSuccessProfileRepository implements ProfileRepository {
  async update(): Promise<ResultType<void, Error>> {
    return Result.ok();
  }
}

class FakeSlowProfileRepository implements ProfileRepository {
  private static readonly DELAY_MS = 100;

  private async delay(): Promise<void> {
    await new Promise((resolve) =>
      setTimeout(resolve, FakeSlowProfileRepository.DELAY_MS)
    );
  }

  async update(): Promise<ResultType<void, Error>> {
    await this.delay();
    return Result.ok();
  }
}
