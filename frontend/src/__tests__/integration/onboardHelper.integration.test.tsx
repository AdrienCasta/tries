import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

import { fileURLToPath } from "url";
import path from "path";
import App from "@/App";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: vi.fn(),
  Toaster: () => null,
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(
  path.resolve(__dirname, "../../../../features/onboardHelper.feature")
);

describeFeature(
  feature,
  ({
    BeforeAllScenarios,
    AfterAllScenarios,
    BeforeEachScenario,
    AfterEachScenario,
    ScenarioOutline,
  }) => {
    BeforeAllScenarios(() => {});

    AfterAllScenarios(() => {});
    BeforeEachScenario(() => {});
    AfterEachScenario(() => {
      cleanup();
    });

    ScenarioOutline(
      `Successfully onboarding a new user as a helper`,
      ({ Given, When, Then, And }, { email, lastname, firstname }) => {
        Given(`the user's email is "<email>"`, () => {
          // Setup step
        });

        And(`the user's first name is "<firstname>"`, () => {
          // Setup step
        });

        And(`the user's last name is "<lastname>"`, () => {
          // Setup step
        });

        When(`I onboard the user`, async () => {
          render(<App />);

          const user = userEvent.setup();

          const emailInput = screen.getByLabelText(/email/i);
          const firstnameInput = screen.getByLabelText(/first name/i);
          const lastnameInput = screen.getByLabelText(/last name/i);
          const submitButton = screen.getByRole("button", { name: /onboard/i });

          await user.type(emailInput, email);
          await user.type(firstnameInput, firstname);
          await user.type(lastnameInput, lastname);
          await user.click(submitButton);
          expect(screen.getByText(/user onboarded/i)).toBeInTheDocument();
        });
        Then(`the user should be onboarded as a helper`, async () => {});

        And(`the user should receive a notification`, () => {});
      }
    );
  }
);
