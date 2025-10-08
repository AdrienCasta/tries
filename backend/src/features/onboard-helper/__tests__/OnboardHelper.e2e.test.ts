import { loadFeatureFromText, describeFeature } from "@amiceli/vitest-cucumber";
import OnboardHelperE2ETest from "./OnboardHelperE2ETest.js";

// @ts-ignore
import featureContent from "../../../../../features/onboardHelper.feature?raw";
import { HelperCommandFixtures } from "./fixtures/HelperCommandFixtures.js";
const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, ScenarioOutline, Scenario }) => {
    let sut: OnboardHelperE2ETest;

    BeforeEachScenario(async () => {
      sut = new OnboardHelperE2ETest();
      await sut.setup();
    });

    AfterEachScenario(async () => {
      await sut.teardown();
    });

    ScenarioOutline(
      `Admin successfully onboards a new helper with valid information`,
      (
        { Given, When, Then, And },
        {
          email,
          lastname,
          firstname,
          phoneNumber,
          profession,
          birthdate,
          frenchCounty,
        }
      ) => {
        Given(`the user's email is "<email>"`, async () => {
          await sut.cleanupEmail(email);
          sut.registerEmailForCleanup(email);
        });

        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});
        And(`the user's phone number is "<phoneNumber>"`, () => {});
        And(`the user's profession is "<profession>"`, () => {});
        And(`the user's birthdate is "<birthdate>"`, () => {});
        And(`the user's county is "<frenchCounty>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({
              email,
              firstname,
              lastname,
              phoneNumber,
              birthdate: new Date(birthdate),
              professions: profession ? [profession] : undefined,
              frenchCounty,
            })
          );
        });

        Then(`the user should be onboarded as a helper`, async () => {
          await sut.assertHelperOnboarded(email);
          await sut.assertHelperInDatabase(email, firstname, lastname);
        });

        And(`the user should receive a notification`, async () => {
          await sut.assertHelperAccountInAuth(email);
          await sut.assertOnlyOneNotificationSent();
        });
      }
    );

    /**
     * CRITICAL E2E SCENARIO #2: Duplicate Prevention
     * Verifies database constraints prevent duplicate helpers via real HTTP
     * Critical for data integrity
     */
    ScenarioOutline(
      `Admin cannot onboard a helper who is already registered`,
      (
        { Given, When, Then, And },
        { email, firstname, lastname, otherUserFirstname, otherUserLastname }
      ) => {
        Given(
          `a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded`,
          async () => {
            sut.registerEmailForCleanup(email);
            await sut.onboardUser(
              HelperCommandFixtures.aValidCommand({
                email,
                firstname,
                lastname,
              })
            );
          }
        );

        When(
          `I attempt to onboard another helper "<otherUserFirstname>" "<otherUserLastname>" with same email`,
          async () => {
            await sut.onboardUser(
              HelperCommandFixtures.aValidCommand({
                email,
                firstname: otherUserFirstname,
                lastname: otherUserLastname,
              })
            );
          }
        );

        Then(`the onboarding should fail because <error>`, async () => {
          await sut.assertOnboardingFailedBecauseEmailHasAlreadyBeenRegistered();
        });

        And(`the helper should not be duplicated`, async () => {
          await sut.assertHelperDetailsNotChanged(email, firstname, lastname);
        });

        And(
          `no notification should be sent for the duplicate attempt`,
          async () => {
            await sut.assertOnlyOneNotificationSent();
          }
        );
      }
    );
  },
  { includeTags: ["e2e"] }
);
