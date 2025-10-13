import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event";
import OnboardHelperPage from "./OnboardHelper.page";
import onboardHelperReducer from "./OnboardHelper.slice";

import {
  fillValidHelperForm,
  submitForm,
} from "./OnboardHelperForm.test-helpers";

describe("Onboarding a helper through the page", () => {
  const store = configureStore({
    reducer: {
      onboardHelper: onboardHelperReducer,
    },
  });

  const renderPage = () => {
    render(
      <Provider store={store}>
        <OnboardHelperPage />
      </Provider>
    );
  };

  describe("Given a user wants to onboard a helper", () => {
    describe("When the helper is onboarded successfully", () => {
      it("Then a success message should be displayed", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillValidHelperForm(user);
        await submitForm(user);

        await waitFor(() => {
          expect(
            screen.getByText(/helper onboarded successfully/i)
          ).toBeInTheDocument();
        });
      });
    });
  });
});
