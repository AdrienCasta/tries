import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import OnboardHelperUnderTest from "./OnboardHelperUnderTest.js";
import { HelperCommandFixtures } from "./fixtures/HelperCommandFixtures.js";

// @ts-ignore
import featureContent from "../../../../../features/onboardHelper.feature?raw";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "Email is required": "INVALID_EMAIL_ERROR",
  "birthdate provided is set to the future.": "BIRTHDATE_IN_FUTUR",
  "age requirement not met. You must be at least 16 yo.": "TOO_YOUNG_TO_WORK",
  "First name too short": "FIRSTNAME_TOO_SHORT",
  "Last name too short": "LASTNAME_TOO_SHORT",
  "Phone number invalid": "PHONE_NUMBER_INVALID",
  "Profession invalid": "UNKNOWN_PROFESSION",
  "this email address is already in use.": "EMAIL_ALREADY_IN_USE",
};
setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, ScenarioOutline, Scenario }) => {
    let sut: OnboardHelperUnderTest;

    BeforeEachScenario(() => {
      sut = new OnboardHelperUnderTest();
      sut.setup();
    });

    ScenarioOutline(
      `Admin successfully onboards a new helper with valid information`,
      (
        { Given, When, Then, And },
        { email, lastname, firstname, phoneNumber, profession, birthdate }
      ) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});
        And(`the user's phone number is "<phoneNumber>"`, () => {});
        And(`the user's profession is "<profession>"`, () => {});
        And(`the user's birthdate is "<birthdate>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({
              email,
              firstname,
              lastname,
              phoneNumber,
              birthdate: new Date(birthdate),
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
      ({ Given, When, Then, And }, { email, error: errorCode }) => {
        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "<email>"`, () => {});
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(HelperCommandFixtures.withEmail(email));
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          await sut.assertHelperIsNotOnboardedWithError(email, errorCode);
        });

        And(`the helper is not onboarded`, async () => {
          await sut.assertNotificationNotSent(email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid name information`,
      (
        { Given, When, Then, And },
        { firstname, lastname, error: errorCode }
      ) => {
        const email = "john@domain.com";

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "<firstname>"`, () => {});
        And(`the last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({ firstname, lastname, email })
          );
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          await sut.assertHelperIsNotOnboardedWithError(email, errorCode);
        });

        And(`the helper is not onboarded`, async () => {
          await sut.assertNotificationNotSent(email);
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
      ({ Given, When, Then, And }, { phoneNumber, error: errorCode }) => {
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
          await sut.assertHelperIsNotOnboardedWithError(email, errorCode);
        });

        And(`the helper is not onboarded`, () => {});
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
      ({ Given, When, Then, And }, { profession, error: errorCode }) => {
        const email = "john@domain.com";

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});
        And(`the profession is "<profession>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({
              email,
              professions: [profession],
            })
          );
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          await sut.assertHelperIsNotOnboardedWithError(email, errorCode);
        });

        And(`the helper is not onboarded`, () => {});
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid birthdate`,
      ({ Given, When, Then, And }, { birthdate, email, error: errorCode }) => {
        Given(`I am onboarding a new helper`, () => {});
        Given("It's {date}", () => {});
        And(`the email address is <email>`, () => {});
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});
        And(`the birthdate is <birthdate>`, () => {});
        When(`I onboard the user`, async () => {});
        Then(`the onboarding fails because <error>`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({
              email,
              birthdate: new Date(birthdate),
            })
          );
        });
        And(`the helper is not onboarded`, async () => {
          expect(
            await sut.assertHelperIsNotOnboardedWithError(email, errorCode)
          );
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard a helper who is already registered`,
      (
        { Given, When, Then, And },
        { email, firstname, lastname, error: errorCode }
      ) => {
        Given(
          `a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded`,
          async () => {
            await sut.onboardUser(
              HelperCommandFixtures.aValidCommand({
                firstname,
                lastname,
                email,
              })
            );
          }
        );

        When(
          `I attempt to onboard another helper "<otherUserFirstname>" "<otherUserLastname>" with same email`,
          async () => {
            await sut.onboardUser(
              HelperCommandFixtures.aValidCommand({
                firstname,
                lastname,
                email,
              })
            );
          }
        );

        Then(`the onboarding should fail because <error>`, async () => {
          await sut.assertHelperIsNotOnboardedWithError(email, errorCode);
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
        const firstname = "John";
        const lastname = "Doe";

        Given(`I am onboarding a new helper with valid information`, () => {});

        And(`the system is temporarily unavailable`, () => {
          sut.simulateInfrastructureFailure();
        });

        When(`I attempt to onboard the user`, async () => {
          await sut.onboardUser(
            HelperCommandFixtures.aValidCommand({ firstname, lastname, email })
          );
        });

        Then(`the onboarding should fail`, () => {});

        And(`the helper should not be onboarded`, async () => {
          await sut.assertHelperIsNotOnboarded(email);
        });

        And(`no notification should be sent`, async () => {
          await sut.assertNotificationNotSent(email);
        });
      }
    );
  }
);
