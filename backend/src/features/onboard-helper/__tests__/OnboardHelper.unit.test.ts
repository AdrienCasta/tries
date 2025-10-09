import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import OnboardHelperUnitHarnessTest from "./OnboardHelper.unit-harness-test.js";
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
  "Invalid french county": "FRENCH_COUNTY_INVALID",
  "this phone number is already in use.": "PHONE_NUMBER_ALREADY_IN_USE",
};
setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, ScenarioOutline }) => {
    let harness: OnboardHelperUnitHarnessTest;

    BeforeEachScenario(() => {
      harness = new OnboardHelperUnitHarnessTest();
      harness.setup();
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
        });
        And(`a welcome email is sent to "<email>"`, async () => {
          await harness.assertNotificationSent(email);
        });
        And(`the helper can access the Tries platform`, () => {});
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper from invalid french county`,
      ({ Given, When, Then, And }, { county, error: errorCode }) => {
        const command = HelperCommandFixtures.withFrenchCounty(county);
        Given(
          `an admin attempts to onboard a helper from county "<county>"`,
          () => {}
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(command);
        });
        Then(`the system rejects the request with "<error>"`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            command.email,
            errorCode
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid email`,
      ({ Given, When, Then, And }, { email, error: errorCode }) => {
        Given(
          `an admin attempts to onboard a helper with email "<email>"`,
          () => {}
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(HelperCommandFixtures.withEmail(email));
        });
        Then(`the system rejects the request with "<error>"`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(email, errorCode);
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid name`,
      (
        { Given, When, Then, And },
        { firstname, lastname, error: errorCode }
      ) => {
        const command = HelperCommandFixtures.aValidCommand({
          firstname,
          lastname,
        });
        Given(
          `an admin attempts to onboard a helper named "<firstname>" "<lastname>"`,
          () => {}
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(command);
        });
        Then(`the system rejects the request with "<error>"`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            command.email,
            errorCode
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid phone number`,
      ({ Given, When, Then, And }, { error, phoneNumber }) => {
        const command = HelperCommandFixtures.aValidCommand({
          phoneNumber,
        });
        Given(
          `an admin attempts to onboard a helper with phone number "<phoneNumber>"`,
          () => {}
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(
            HelperCommandFixtures.aValidCommand(command)
          );
        });
        Then(`the system rejects the request with "<error>"`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            command.email,
            error
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid profession(s)`,
      ({ Given, When, Then, And }, { professions, error: errorCode }) => {
        const command = HelperCommandFixtures.aValidCommand({
          professions: professions.trim("").split(","),
        });
        Given(
          "an admin attempts to onboard a helper with professions <professions>",
          () => {}
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(command);
        });
        Then(`the system rejects the request with <error>`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            command.email,
            errorCode
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid birthdate`,
      ({ Given, When, Then, And }, { birthdate, error: errorCode }) => {
        const command = HelperCommandFixtures.aValidCommand({
          birthdate: new Date(birthdate),
        });
        Given("it is {date}", (ctx, date) => {
          harness.setup(date);
        });
        And(
          "an admin attempts to onboard a helper born on <birthdate>",
          () => {}
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(command);
        });
        Then(`the system rejects the request with <error>`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            command.email,
            errorCode
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );
    ScenarioOutline(
      `Admin cannot onboard a helper with phone number already in use`,
      ({ Given, When, Then, And }, { phoneNumber, error: errorCode }) => {
        const secondCommand = HelperCommandFixtures.aValidCommand({
          phoneNumber,
        });
        Given(
          "a helper with phone number <phoneNumber> is already onboarded",
          async () => {
            await harness.onboardUser(
              HelperCommandFixtures.aValidCommand({
                phoneNumber,
              })
            );
          }
        );
        When(
          "an admin attempts to onboard a user with the same phone number",
          async () => {
            await harness.onboardUser(secondCommand);
          }
        );
        Then(`the system rejects the request because <error>`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            phoneNumber,
            errorCode
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(secondCommand.email);
        });
      }
    );
  },
  {
    includeTags: ["unit"],
  }
);
