import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { signupUsecase } from "./Signup.usecase";
import signupReducer from "./Signup.slice";
import {
  FakeSuccessAuthRepository,
  FakeFailureAuthRepository,
  FakeSlowAuthRepository,
} from "../shared/test-helpers/fakes";

function createStore() {
  return configureStore({
    reducer: {
      signup: signupReducer,
    },
  });
}

describe("User Signup", () => {
  const command = {
    email: "john@example.com",
    password: "SecurePass123!",
  };
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe("Given a user wants to sign up", () => {
    describe("When signup has not started", () => {
      it("Then the current state should be idle", () => {
        const state = store.getState().signup;
        expect(state.status).toBe("idle");
      });
    });

    describe("When user signs up successfully", () => {
      it("Then the current state should be completed", async () => {
        const repository = new FakeSuccessAuthRepository();
        const useCase = signupUsecase(repository, store.dispatch);

        await useCase.execute(command);

        const state = store.getState().signup;
        expect(state.status).toBe("completed");
      });
    });

    describe("When signup fails", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeFailureAuthRepository();
        const useCase = signupUsecase(repository, store.dispatch);

        await useCase.execute(command);

        const state = store.getState().signup;
        expect(state.status).toBe("failed");
      });
    });

    describe("When signup is in progress", () => {
      it("Then the current state should be started", async () => {
        const repository = new FakeSlowAuthRepository();
        const useCase = signupUsecase(repository, store.dispatch);

        const signupPromise = useCase.execute(command);

        const state = store.getState().signup;
        expect(state.status).toBe("started");

        await signupPromise;
      });
    });

    describe("When command has invalid email", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeSuccessAuthRepository();
        const useCase = signupUsecase(repository, store.dispatch);
        const invalidCommand = { ...command, email: "invalid-email" };

        await useCase.execute(invalidCommand);

        const state = store.getState().signup;
        expect(state.status).toBe("failed");
      });
    });

    describe("When command has invalid password", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeSuccessAuthRepository();
        const useCase = signupUsecase(repository, store.dispatch);
        const invalidCommand = { ...command, password: "short" };

        await useCase.execute(invalidCommand);

        const state = store.getState().signup;
        expect(state.status).toBe("failed");
      });
    });
  });
});
