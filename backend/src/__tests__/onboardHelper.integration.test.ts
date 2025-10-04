import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import OnboardHelperIntegrationTest from "./sut/OnboardHelperIntegrationTest.js";
import { fileURLToPath } from "url";
import path from "path";

/**
 * INTEGRATION TESTS - Business Logic Integration (No Real Infrastructure)
 *
 * These tests verify business flow integration without infrastructure overhead:
 * - FakeHttpServer (lightweight, no real HTTP framework)
 * - Route handling
 * - Controller logic
 * - Use case execution
 * - In-memory repositories (fast, no external dependencies)
 *
 * This is the primary test suite for business logic integration.
 * E2E tests use real Fastify + Supabase for critical scenarios.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(
  path.resolve(__dirname, "../../../features/onboardHelper.feature")
);

const createUser = (
  email: string,
  firstname: string,
  lastname: string
) => ({
  email,
  firstname,
  lastname,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, ScenarioOutline, Scenario }) => {
    let sut: OnboardHelperIntegrationTest;

    BeforeEachScenario(async () => {
      sut = new OnboardHelperIntegrationTest();
      await sut.setup();
    });

    AfterEachScenario(async () => {
      await sut.teardown();
    });

    ScenarioOutline(
      `Admin successfully onboards a new helper with valid information`,
      ({ Given, When, Then, And }, { email, lastname, firstname }) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(createUser(email, firstname, lastname));
        });

        Then(`the user should be onboarded as a helper`, async () => {
          await sut.assertHelperOnboarded(email);
        });

        And(`the user should receive a notification`, async () => {
          await sut.assertNotificationSent(email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid email address`,
      ({ Given, When, Then, And }, { email, error }) => {
        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "<email>"`, () => {});
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(createUser(email, "John", "Doe"));
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          await sut.assertOnboardingFailedWithError(error);
        });

        And(`the helper is not onboarded`, async () => {
          await sut.assertHelperNotOnboarded(email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid name information`,
      ({ Given, When, Then, And }, { firstname, lastname, error }) => {
        const email = "john@domain.com";

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "<firstname>"`, () => {});
        And(`the last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(createUser(email, firstname, lastname));
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          await sut.assertOnboardingFailedWithError(error);
        });

        And(`the helper is not onboarded`, async () => {
          await sut.assertHelperNotOnboarded(email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard a helper who is already registered`,
      (
        { Given, When, Then, And },
        { email, firstname, lastname, otherUserFirstname, otherUserLastname }
      ) => {
        Given(
          `a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded`,
          async () => {
            await sut.onboardUser(createUser(email, firstname, lastname));
          }
        );

        When(
          `I attempt to onboard another helper "<otherUserFirstname>" "<otherUserLastname>" with same email`,
          async () => {
            await sut.onboardUser(
              createUser(email, otherUserFirstname, otherUserLastname)
            );
          }
        );

        Then(`the onboarding should fail`, async () => {
          await sut.assertOnboardingFailedWithDuplicateEmail();
        });

        And(`the helper should not be duplicated`, async () => {
          await sut.assertHelperDetailsNotChanged(email, firstname, lastname);
        });

        And(
          `no notification should be sent for the duplicate attempt`,
          async () => {
            await sut.assertOnlyOneNotificationSentTo(email);
          }
        );
      }
    );

    Scenario(
      `Admin cannot onboard helper when system is temporarily unavailable`,
      ({ Given, When, Then, And }) => {
        const email = "john@domain.com";

        Given(`I am onboarding a new helper with valid information`, () => {});

        And(`the system is temporarily unavailable`, () => {
          sut.simulateSystemUnavailable();
        });

        When(`I attempt to onboard the user`, async () => {
          await sut.onboardUser(createUser(email, "John", "Doe"));
        });

        Then(`the onboarding should fail`, async () => {
          await sut.assertOnboardingFailed();
        });

        And(`the helper should not be onboarded`, async () => {
          await sut.assertHelperNotOnboarded(email);
        });

        And(`no notification should be sent`, async () => {
          await sut.assertNotificationNotSent(email);
        });
      }
    );
  }
);
