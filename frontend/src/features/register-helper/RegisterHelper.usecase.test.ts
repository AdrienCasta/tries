import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { registerHelperUsecase } from "./RegisterHelper.usecase";
import onboardHelperReducer from "./RegisterHelper.slice";
import { HelperCommandFixtures } from "../shared/test-helpers/fixtures";
import {
  FakeSuccessRepository,
  FakeFailureRepository,
  FakeSlowRepository,
} from "../shared/test-helpers/fakes";

function createStore() {
  return configureStore({
    reducer: {
      onboardHelper: onboardHelperReducer,
    },
  });
}

describe("Onboarding a helper", () => {
  const command = HelperCommandFixtures.aValidCommand();
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe("Given a helper to onboard", () => {
    describe("When onboarding has not started", () => {
      it("Then the current state should be idle", () => {
        const state = store.getState().onboardHelper;
        expect(state.status).toBe("idle");
      });
    });

    describe("When helper is onboarded successfully", () => {
      it("Then the current state should be completed", async () => {
        const repository = new FakeSuccessRepository();
        const useCase = registerHelperUsecase(repository, store.dispatch);

        await useCase.execute(command);

        const state = store.getState().onboardHelper;
        expect(state.status).toBe("completed");
      });
    });

    describe("When helper onboarding fails", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeFailureRepository();
        const useCase = registerHelperUsecase(repository, store.dispatch);

        await useCase.execute(command);

        const state = store.getState().onboardHelper;
        expect(state.status).toBe("failed");
      });
    });

    describe("When helper is being onboarded", () => {
      it("Then the current state should be started", async () => {
        const repository = new FakeSlowRepository();
        const useCase = registerHelperUsecase(repository, store.dispatch);

        const onboardPromise = useCase.execute(command);

        const state = store.getState().onboardHelper;
        expect(state.status).toBe("started");

        await onboardPromise;
      });
    });

    describe("When command has invalid email", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeSuccessRepository();
        const useCase = registerHelperUsecase(repository, store.dispatch);
        const invalidCommand = { ...command, email: "invalid-email" };

        await useCase.execute(invalidCommand);

        const state = store.getState().onboardHelper;
        expect(state.status).toBe("failed");
      });
    });
  });
});
