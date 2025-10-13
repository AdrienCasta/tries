import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { onboardHelperUseCase } from "./onboardHelper.usecase";
import onboardingReducer from "../store/onboardingSlice";
import { HelperCommandFixtures } from "../__tests__/fixtures/HelperCommandFixtures";
import {
  FakeSuccessRepository,
  FakeFailureRepository,
  FakeSlowRepository,
} from "../__tests__/fakes/FakeHelperRepositories";

function createStore() {
  return configureStore({
    reducer: {
      onboarding: onboardingReducer,
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
        const state = store.getState().onboarding;
        expect(state.status).toBe("idle");
      });
    });

    describe("When helper is onboarded successfully", () => {
      it("Then the current state should be completed", async () => {
        const repository = new FakeSuccessRepository();
        const useCase = onboardHelperUseCase(repository, store.dispatch);

        await useCase.execute(command);

        const state = store.getState().onboarding;
        expect(state.status).toBe("completed");
      });
    });

    describe("When helper onboarding fails", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeFailureRepository();
        const useCase = onboardHelperUseCase(repository, store.dispatch);

        await useCase.execute(command);

        const state = store.getState().onboarding;
        expect(state.status).toBe("failed");
      });
    });

    describe("When helper is being onboarded", () => {
      it("Then the current state should be started", async () => {
        const repository = new FakeSlowRepository();
        const useCase = onboardHelperUseCase(repository, store.dispatch);

        const onboardPromise = useCase.execute(command);

        const state = store.getState().onboarding;
        expect(state.status).toBe("started");

        await onboardPromise;
      });
    });

    describe("When command has invalid email", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeSuccessRepository();
        const useCase = onboardHelperUseCase(repository, store.dispatch);
        const invalidCommand = { ...command, email: "invalid-email" };

        await useCase.execute(invalidCommand);

        const state = store.getState().onboarding;
        expect(state.status).toBe("failed");
      });
    });
  });
});
