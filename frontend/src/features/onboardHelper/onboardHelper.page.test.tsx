import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

import OnboardHelperPage from "./OnboardHelper.page";
import { HelperFormDataFixtures } from "./__tests__/fixtures/HelperFormDataFixtures";
import type { OnboardHelperFormData } from "./types/OnboardHelperForm.types";

const DEFAULT_HELPER_ID = "123e4567-e89b-12d3-a456-426614174000";
const API_ENDPOINT = "/api/helpers/onboard";

const mockSuccessResponse = (helperId = DEFAULT_HELPER_ID): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => ({
      helperId,
      message: "Helper onboarded successfully",
    }),
    headers: new Headers({ "content-type": "application/json" }),
  } as Response);

const fillAndSubmitHelperForm = async (
  user: ReturnType<typeof userEvent.setup>,
  data: OnboardHelperFormData
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
import featureContent from "@features/onboardHelper.feature?raw";
const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ Background, BeforeEachScenario, AfterEachScenario, ScenarioOutline }) => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    Background(({ Given }) => {
      Given("the admin is authenticated", () => {});
    });

    BeforeEachScenario(() => {
      fetchSpy = vi.spyOn(global, "fetch");
    });

    AfterEachScenario(() => {
      fetchSpy.mockRestore();
      vi.clearAllMocks();
    });

    ScenarioOutline(
      `Admin onboards a qualified helper`,
      ({ Given, When, Then, And }, { email, firstname, lastname }) => {
        let formData: OnboardHelperFormData;

        Given(`an admin has a qualified helper's information`, () => {
          formData = HelperFormDataFixtures.aValidFormData({
            email,
            firstname,
            lastname,
          });
        });

        When(
          `the admin submits the onboarding request for "<firstname>" "<lastname>"`,
          async () => {
            fetchSpy.mockImplementationOnce(async () => mockSuccessResponse());

            const user = userEvent.setup();
            render(<OnboardHelperPage />);
            await fillAndSubmitHelperForm(user, formData);

            expect(fetchSpy).toHaveBeenCalledWith(
              API_ENDPOINT,
              expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
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
