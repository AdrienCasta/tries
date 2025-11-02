import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import emailVerificationReducer, {
  emailVerificationInitialState,
} from "./EmailVerification.slice";
import {
  FakeSuccessAuthService,
  FakeFailureAuthService,
} from "../shared/test-helpers/fakes";
import { verifyEmailUsecase } from "./EmailVerification.usecase";

function createStore() {
  return configureStore({
    reducer: {
      emailVerification: emailVerificationReducer,
    },
  });
}

describe("Email verification", () => {
  const validCommand = {
    email: "john@example.com",
    otpCode: "123456",
  };
  let store: ReturnType<typeof createStore>;

  const getVerificationState = () => store.getState().emailVerification;

  beforeEach(() => {
    store = createStore();
  });

  describe("Given a user wants to verify its email", () => {
    describe("When verify has not started", () => {
      it("Then the current state should be idle", () => {
        expect(getVerificationState()).toStrictEqual(
          emailVerificationInitialState
        );
      });
    });

    describe.only("When user verify email successfully", () => {
      it("Then the current state should be completed", async () => {
        const repository = new FakeSuccessAuthService();
        const useCase = verifyEmailUsecase(repository, store.dispatch);

        await useCase.execute(validCommand);

        expect(getVerificationState()).toStrictEqual({
          ...emailVerificationInitialState,
          isVerified: true,
        });
      });
    });

    describe("When verification fails", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeFailureAuthService();
        const useCase = verifyEmailUsecase(repository, store.dispatch);

        await useCase.execute(validCommand);

        expect(getVerificationState()).toStrictEqual({
          ...emailVerificationInitialState,
          verificationError: "Échec de la vérification",
        });
      });
    });

    describe("When verification is in progress", () => {
      it("Then the current state should be started", async () => {
        const repository = new FakeSuccessAuthService();
        repository.slow = true;
        const useCase = verifyEmailUsecase(repository, store.dispatch);

        const verificationPromise = useCase.execute(validCommand);

        expect(getVerificationState()).toStrictEqual({
          ...emailVerificationInitialState,
          isVerifying: true,
        });

        await verificationPromise;
      });
    });

    describe("When command has invalid email or otp code", () => {
      it("Then the current state should be failed", async () => {
        const repository = new FakeSuccessAuthService();
        const useCase = verifyEmailUsecase(repository, store.dispatch);
        const invalidCommand = {
          ...validCommand,
          otpCode: "",
        };

        await useCase.execute(invalidCommand);

        expect(getVerificationState()).toStrictEqual({
          ...emailVerificationInitialState,
          verificationError: "Format d'email ou de code OTP invalide",
        });
      });
    });
  });
});
