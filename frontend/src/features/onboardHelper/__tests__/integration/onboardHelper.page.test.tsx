import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

import OnboardHelperPage from "../../OnboardHelper.page";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const DEFAULT_HELPER_ID = "123";

// Test Data Builders
type HelperFormData = {
  email: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  profession: string;
  birthdate: string;
  frenchCounty: string;
};

const mockSuccessResponse = (helperId = DEFAULT_HELPER_ID): Response =>
  ({
    ok: true,
    json: async () => ({
      helperId,
      message: "Helper onboarded successfully",
    }),
  } as Response);

const fillAndSubmitHelperForm = async (
  user: ReturnType<typeof userEvent.setup>,
  data: HelperFormData
) => {
  await user.type(screen.getByLabelText(/email/i), data.email);
  await user.type(screen.getByLabelText(/first name/i), data.firstname);
  await user.type(screen.getByLabelText(/last name/i), data.lastname);
  await user.type(screen.getByLabelText(/phone number/i), data.phoneNumber);
  await user.selectOptions(
    screen.getByLabelText(/profession/i),
    data.profession
  );
  await user.type(screen.getByLabelText(/birthdate/i), data.birthdate);
  await user.selectOptions(screen.getByLabelText(/county/i), data.frenchCounty);

  await user.click(screen.getByRole("button", { name: /onboard/i }));
};

// @ts-ignore
import featureContent from "../../../../../../features/onboardHelper.feature?raw";
const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ AfterEachScenario, ScenarioOutline }) => {
    AfterEachScenario(() => {
      cleanup();
      vi.clearAllMocks();
    });

    ScenarioOutline(
      `Admin successfully onboards a new helper with valid information`,
      (
        { Given, When, Then, And },
        {
          email,
          firstname,
          lastname,
          phoneNumber,
          profession,
          birthdate,
          frenchCounty,
        }
      ) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});
        And(`the user's phone number is "<phoneNumber>"`, () => {});
        And(`the user's profession is "<profession>"`, () => {});
        And(`the user's birthdate is "<birthdate>"`, () => {});
        And(`the user's county is "<frenchCounty>"`, () => {});

        When(`I onboard the user`, async () => {
          const user = userEvent.setup();

          mockFetch.mockResolvedValueOnce(mockSuccessResponse());
          render(<OnboardHelperPage />);

          await fillAndSubmitHelperForm(user, {
            email,
            firstname,
            lastname,
            phoneNumber,
            profession,
            birthdate,
            frenchCounty,
          });

          expect(
            await screen.findByText(/user onboarded/i)
          ).toBeInTheDocument();
        });

        Then(`the user should be onboarded as a helper`, () => {});

        And(`the user should receive a notification`, () => {});
      }
    );
  },
  { includeTags: ["frontend"] }
);
