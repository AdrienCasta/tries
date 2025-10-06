import { loadFeatureFromText, describeFeature } from "@amiceli/vitest-cucumber";
import OnboardHelperIntegrationTest from "./OnboardHelperIntegrationTest.js";

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

// @ts-ignore
import featureContent from "../../../../../features/onboardHelper.feature?raw";
const feature = await loadFeatureFromText(featureContent);

import { HelperCommandFixtures } from "./fixtures/HelperCommandFixtures.js";
import { OnboardHelperCommand } from "../OnboardHelper.command.js";

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
      (
        { Given, When, Then, And },
        { email, lastname, firstname, phoneNumber, profession }
      ) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});
        And(`the user's phone number is "<phoneNumber>"`, () => {});
        And(`the user's profession is "<profession>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({
              email,
              firstname,
              lastname,
              phoneNumber,
              professions: profession ? [profession] : undefined,
            })
          );
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
          await sut.onboardUser(HelperCommandFixtures.withEmail(email));
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
          await sut.onboardUser(
            HelperCommandFixtures.withNameAndEmail(email, firstname, lastname)
          );
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
      `Admin successfully onboards a new helper with phone number`,
      (
        { Given, When, Then, And },
        { email, firstname, lastname, phoneNumber }
      ) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});
        And(`the user's phone number is "<phoneNumber>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({
              email,
              firstname,
              lastname,
              phoneNumber,
            })
          );
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
      `Admin cannot onboard helper with invalid phone number`,
      ({ Given, When, Then, And }, { phoneNumber, error }) => {
        const email = "john@domain.com";

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});
        And(`the phone number is "<phoneNumber>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({ phoneNumber })
          );
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
      `Admin successfully onboards a helper with valid profession`,
      (
        { Given, When, Then, And },
        { email, firstname, lastname, profession }
      ) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});
        And(`the user's profession is "<profession>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({
              email,
              firstname,
              lastname,
              professions: [profession],
            })
          );
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
      `Admin cannot onboard helper with invalid profession`,
      ({ Given, When, Then, And }, { profession, error }) => {
        const email = "john@domain.com";

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});
        And(`the profession is "<profession>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({
              professions: [profession],
            })
          );
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
            await sut.onboardUser(
              HelperCommandFixtures.withNameAndEmail(email, firstname, lastname)
            );
          }
        );

        When(
          `I attempt to onboard another helper "<otherUserFirstname>" "<otherUserLastname>" with same email`,
          async () => {
            await sut.onboardUser(
              HelperCommandFixtures.withNameAndEmail(
                email,
                otherUserFirstname,
                otherUserLastname
              )
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
          await sut.onboardUser(HelperCommandFixtures.withEmail(email));
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
