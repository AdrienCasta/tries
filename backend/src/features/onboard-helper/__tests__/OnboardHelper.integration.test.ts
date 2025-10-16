import {
  loadFeatureFromText,
  describeFeature,
  setVitestCucumberConfiguration,
  getVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import OnboardHelperIntegrationHarnessTest from "./OnboardHelper.integration-harness-test.js";

// @ts-ignore
import featureContent from "../../../../../features/onboardHelper.feature?raw";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "Email is required": {
    statusCode: 400,
    errorBody: { code: "INVALID_EMAIL_ERROR" },
  },
  "birthdate provided is set to the future.": {
    statusCode: 400,
    errorBody: { code: "BIRTHDATE_IN_FUTUR" },
  },
  "age requirement not met. You must be at least 16 yo.": {
    statusCode: 400,
    errorBody: { code: "TOO_YOUNG_TO_WORK" },
  },
  "First name too short": {
    statusCode: 400,
    errorBody: { code: "FIRSTNAME_TOO_SHORT" },
  },
  "Last name too short": {
    statusCode: 400,
    errorBody: { code: "LASTNAME_TOO_SHORT" },
  },
  "Phone number invalid": {
    statusCode: 400,
    errorBody: { code: "PHONE_NUMBER_INVALID" },
  },
  "Profession invalid": {
    statusCode: 400,
    errorBody: { code: "UNKNOWN_PROFESSION" },
  },
  "this email address is already in use.": {
    statusCode: 409,
    errorBody: { code: "EMAIL_ALREADY_IN_USE" },
  },
  "Invalid french county": {
    statusCode: 400,
    errorBody: { code: "FRENCH_COUNTY_INVALID" },
  },
  "this phone number is already in use.": {
    statusCode: 409,
    errorBody: { code: "PHONE_NUMBER_ALREADY_IN_USE" },
  },
  "Rpps must be 11 digits long": {
    statusCode: 400,
    errorBody: { code: "RPPS_INVALID" },
  },
  "Adeli must be 9 digits long": {
    statusCode: 400,
    errorBody: { code: "ADELI_INVALID" },
  },
  "Profession requires different health id type": {
    statusCode: 400,
    errorBody: { code: "WRONG_HEALTH_ID_TYPE" },
  },
};
setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

import { HelperCommandFixtures } from "./fixtures/HelperCommandFixtures.js";

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, ScenarioOutline, Scenario }) => {
    let harness: OnboardHelperIntegrationHarnessTest;

    BeforeEachScenario(async () => {
      harness = new OnboardHelperIntegrationHarnessTest();
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
        });
        And(`a welcome email is sent to "<email>"`, async () => {
          await harness.assertNotificationSent(email);
        });
        And(`the helper can access the Tries platform`, () => {});
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper from invalid french county`,
      ({ Given, When, Then, And }, { county, error }) => {
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
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid email`,
      ({ Given, When, Then, And }, { email, error }) => {
        Given(
          `an admin attempts to onboard a helper with email "<email>"`,
          () => {}
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(HelperCommandFixtures.withEmail(email));
        });
        Then(`the system rejects the request with "<error>"`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid name`,
      ({ Given, When, Then, And }, { firstname, lastname, error }) => {
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
            error.statusCode,
            error.errorBody
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
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid profession(s)`,
      ({ Given, When, Then, And }, { professions, error }) => {
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
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid birthdate`,
      ({ Given, When, Then, And }, { birthdate, error }) => {
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
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );
    ScenarioOutline(
      `Admin cannot onboard a helper with phone number already in use`,
      ({ Given, When, Then, And }, { phoneNumber, error }) => {
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
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {
          await harness.assertNotificationNotSent(secondCommand.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid rpps id as a physiotherapist`,
      ({ Given, When, Then, And }, { error, rppsId }) => {
        let command: any;
        Given(
          `an admin attempts to onboard a helper as a physiotherapist with rpps id: <rppsId>`,
          () => {
            command = HelperCommandFixtures.aValidCommand({
              professions: [
                {
                  code: "physiotherapist",
                  healthId: {
                    rpps: rppsId,
                  },
                },
              ],
            });
          }
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(command);
        });
        Then(`the system rejects the request with <error>`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {});
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid adeli id as a sports coach`,
      ({ Given, When, Then, And }, { error, adeliId }) => {
        let command: any;
        Given(
          `an admin attempts to onboard a helper as a sports coach with adeli id: <adeliId>`,
          () => {
            command = HelperCommandFixtures.aValidCommand({
              professions: [
                {
                  code: "sports_coach",
                  healthId: {
                    adeli: adeliId,
                  },
                },
              ],
            });
          }
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(command);
        });
        Then(`the system rejects the request with <error>`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {});
      }
    );

    ScenarioOutline(
      `Admin onboards helper with valid health id for multi-type professions`,
      ({ Given, When, Then, And }, { profession, healthIdType, healthIdValue }) => {
        let command: any;
        Given(
          `an admin attempts to onboard a helper with profession <profession> and health id type <healthIdType> with value <healthIdValue>`,
          () => {
            command = HelperCommandFixtures.aValidCommand({
              professions: [
                {
                  code: profession,
                  healthId: {
                    [healthIdType]: healthIdValue,
                  },
                },
              ],
            });
          }
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(command);
        });
        Then(`a helper account is created`, async () => {
          await harness.assertHelperOnboarded(command.email);
        });
        And(`a welcome email is sent`, async () => {
          await harness.assertNotificationSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with wrong health id type`,
      ({ Given, When, Then, And }, { error, profession, healthIdType, healthIdValue }) => {
        let command: any;
        Given(
          `an admin attempts to onboard a helper with profession <profession> and health id type <healthIdType> with value <healthIdValue>`,
          () => {
            command = HelperCommandFixtures.aValidCommand({
              professions: [
                {
                  code: profession,
                  healthId: {
                    [healthIdType]: healthIdValue,
                  },
                },
              ],
            });
          }
        );
        When(`the admin submits the onboarding request`, async () => {
          await harness.onboardUser(command);
        });
        Then(`the system rejects the request with <error>`, async () => {
          await harness.assertHelperIsNotOnboardedWithError(
            error.statusCode,
            error.errorBody
          );
        });
        And(`no helper account is created`, async () => {});
      }
    );
  },
  { includeTags: ["integration"] }
);
