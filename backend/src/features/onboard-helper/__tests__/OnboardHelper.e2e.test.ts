import { loadFeatureFromText, describeFeature } from "@amiceli/vitest-cucumber";
import OnboardHelperE2eHarnessTest from "./OnboardHelper.e2e-harness-test.js";

// @ts-ignore
import featureContent from "../../../../../features/onboardHelper.feature?raw";
import { HelperCommandFixtures } from "./fixtures/HelperCommandFixtures.js";
const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, ScenarioOutline, Scenario }) => {
    let harness: OnboardHelperE2eHarnessTest;

    BeforeEachScenario(async () => {
      harness = new OnboardHelperE2eHarnessTest();
      await harness.setup();
    });

    AfterEachScenario(async () => {
      await harness.teardown();
    });

    ScenarioOutline(
      `Admin onboards a qualified helper`,
      ({ Given, When, Then, And }, { email, lastname, firstname }) => {
        Given(`an admin has a qualified helper's information`, () => {});
        When(
          `the admin submits the onboarding request for "<firstname>" "<lastname>"`,
          async () => {
            await harness.onboardUser(
              HelperCommandFixtures.aValidCommand({
                email,
                firstname,
                lastname,
              })
            );
          }
        );
        Then(`a helper account is created for "<email>"`, async () => {
          await harness.assertHelperOnboarded(email);
          await harness.assertHelperInDatabase(email, firstname, lastname);
        });
        And(`a welcome email is sent to "<email>"`, async () => {
          await harness.assertHelperAccountInAuth(email);
          // await harness.assertOnlyOneNotificationSent();
        });
        And(`the helper can access the Tries platform`, () => {});
      }
    );

    ScenarioOutline(
      `Admin cannot onboard a helper with duplicate email`,
      ({ Given, When, Then, And }, { email, firstname, lastname }) => {
        const command = HelperCommandFixtures.aValidCommand({
          email,
          firstname,
          lastname,
        });
        Given(
          `a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded`,
          async () => {
            harness.registerEmailForCleanup(email);
            await harness.onboardUser(command);
          }
        );

        When(
          `an admin attempts to onboard a user with the same email`,
          async () => {
            await harness.onboardUser(
              HelperCommandFixtures.aValidCommand({
                email,
              })
            );
          }
        );

        Then(`the system rejects the request because <error>`, async () => {
          await harness.assertOnboardingFailedBecauseEmailHasAlreadyBeenRegistered();
        });

        And(`the helper is not duplicated`, async () => {
          await harness.assertHelperDetailsNotChanged(
            email,
            firstname,
            lastname
          );
        });

        And(`no notification is sent`, async () => {
          await harness.assertOnlyOneNotificationSent();
        });
      }
    );
  },
  { includeTags: ["e2e"] }
);
