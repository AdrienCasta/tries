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
  ({ Background, BeforeEachScenario, ScenarioOutline }) => {
    Background(({ Given }) => {
      Given("the admin is authenticated", () => {});
    });

    BeforeEachScenario(() => {
      vi.clearAllMocks();
    });

    ScenarioOutline(
      `Admin onboards a qualified helper`,
      ({ Given, When, Then, And }, { email, firstname, lastname }) => {
        const defaultHelperData = {
          phoneNumber: "+33612345678",
          profession: "physiotherapist",
          birthdate: "1995-03-26",
          frenchCounty: "44",
        };

        Given(`an admin has a qualified helper's information`, () => {});

        When(
          `the admin submits the onboarding request for "<firstname>" "<lastname>"`,
          async () => {
            const user = userEvent.setup();
            mockFetch.mockResolvedValueOnce(mockSuccessResponse());
            render(<OnboardHelperPage />);

            await fillAndSubmitHelperForm(user, {
              email,
              firstname,
              lastname,
              ...defaultHelperData,
            });

            expect(mockFetch).toHaveBeenCalledWith(
              "/api/helpers/onboard",
              expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email,
                  firstname,
                  lastname,
                  ...defaultHelperData,
                }),
              })
            );

            expect(
              await screen.findByText(/user onboarded/i)
            ).toBeInTheDocument();
          }
        );

        Then(`a helper account is created for "<email>"`, () => {});

        And(`a welcome email is sent to "<email>"`, () => {});

        And(`the helper can access the Tries platform`, () => {});
      }
    );
  },
  { includeTags: ["frontend"] }
);
