import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event";
import OnboardHelperPage from "./OnboardHelper.page";
import onboardingReducer from "./store/onboardingSlice";
import { helperContainer } from "./infrastructure/di/helperContainer";
import { HelperCommandFixtures } from "./__tests__/fixtures/HelperCommandFixtures";
import {
  FakeSuccessRepository,
  FakeFailureRepository,
  FakeSlowRepository,
} from "./__tests__/fakes/FakeHelperRepositories";
import {
  fillValidHelperForm,
  submitForm,
} from "./components/OnboardHelperForm.test-helpers";

function createStore() {
  return configureStore({
    reducer: {
      onboarding: onboardingReducer,
    },
  });
}

describe("Onboarding a helper through the page", () => {
  let store: ReturnType<typeof createStore>;

  const renderPage = () => {
    render(
      <Provider store={store}>
        <OnboardHelperPage />
      </Provider>
    );
  };

  beforeEach(() => {
    store = createStore();
    helperContainer.setHelperRepository(new FakeSuccessRepository());
  });

  describe("Given a user wants to onboard a helper", () => {
    describe("When the helper is onboarded successfully", () => {
      it("Then a success message should be displayed", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillValidHelperForm(user);
        await submitForm(user);

        await waitFor(() => {
          expect(screen.getByText(/helper onboarded successfully/i)).toBeInTheDocument();
        });
      });
    });

    describe("When the helper onboarding fails", () => {
      it("Then an error message should be displayed", async () => {
        const user = userEvent.setup();

        helperContainer.setHelperRepository(new FakeFailureRepository());

        renderPage();

        await fillValidHelperForm(user);
        await submitForm(user);

        await waitFor(() => {
          expect(screen.getByText(/failed to onboard helper/i)).toBeInTheDocument();
        });
      });
    });

    describe("When the helper is being onboarded", () => {
      it("Then the submit button should be disabled", async () => {
        const user = userEvent.setup();

        helperContainer.setHelperRepository(new FakeSlowRepository());

        renderPage();

        await fillValidHelperForm(user);

        const submitButton = screen.getByRole("button", { name: /onboard/i });
        expect(submitButton).not.toBeDisabled();

        await submitForm(user);

        expect(submitButton).toBeDisabled();

        await waitFor(() => {
          expect(screen.getByText(/helper onboarded successfully/i)).toBeInTheDocument();
        });
      });
    });
  });
});
