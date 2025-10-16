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
import { OnboardHelperCommand } from "../OnboardHelper.command.js";
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
  "Rpps must be 11 digits long": "RPPS_INVALID",
  "Adeli must be 9 digits long": "ADELI_INVALID",
  "Profession requires different health id type": "WRONG_HEALTH_ID_TYPE",
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
      `Admin cannot onboard helper with invalid rpps id as a physiotherapist`,
      ({ Given, When, Then, And }, { error: errorCode, rppsId }) => {
        let command: OnboardHelperCommand;
        Given(
          `an admin attempts to onboard a helper as a physiotherapist with rpps id: <rppsId>`,
          () => {
            command = HelperCommandFixtures.withProfession("physiotherapist", {
              rpps: rppsId,
            });
          }
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
        And(`no helper account is created`, async () => {});
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid adeli id as a sports coach`,
      ({ Given, When, Then, And }, { error: errorCode, adeliId }) => {
        let command: OnboardHelperCommand;
        Given(
          `an admin attempts to onboard a helper as a sports coach with adeli id: <adeliId>`,
          () => {
            command = HelperCommandFixtures.withProfession("sports_coach", {
              adeli: adeliId,
            });
          }
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
        And(`no helper account is created`, async () => {});
      }
    );

    ScenarioOutline(
      `Admin onboards helper with valid health id for multi-type professions`,
      (
        { Given, When, Then, And },
        { profession, healthIdType, healthIdValue }
      ) => {
        let command: OnboardHelperCommand;
        Given(
          `an admin attempts to onboard a helper with profession <profession> and health id type <healthIdType> with value <healthIdValue>`,
          () => {
            command = HelperCommandFixtures.withProfession(
              profession,
              // @ts-expect-error
              {
                [healthIdType]: healthIdValue,
              }
            );
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
      (
        { Given, When, Then, And },
        { error: errorCode, profession, healthIdType, healthIdValue }
      ) => {
        let command: OnboardHelperCommand;
        Given(
          `an admin attempts to onboard a helper with profession <profession> and health id type <healthIdType> with value <healthIdValue>`,
          () => {
            command = HelperCommandFixtures.withProfession(
              profession,
              // @ts-expect-error
              {
                [healthIdType]: healthIdValue,
              }
            );
          }
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
        And(`no helper account is created`, async () => {});
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

    ScenarioOutline(
      `Admin cannot onboard helper when system is unavailable`,
      ({ Given, And, When, Then }, { scenario }) => {
        const command = HelperCommandFixtures.aValidCommand();
        Given("an admin has valid helper information", () => {});
        And("the system is temporarily unavailable in scenario <scenario>", () => {
            harness.simulateInfrastructureFailure();
        });
        When("the admin attempts to onboard the helper", async () => {
          await harness.onboardUser(command);
        });
        Then("the system cannot process the request", async () => {
          await harness.assertHelperIsNotOnboarded(command.email);
        });
        And("no helper account is created", async () => {
          await harness.assertNotificationNotSent(command.email);
        });
        And("no notification is sent", async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );

    ScenarioOutline(
      `System rolls back account when helper save fails`,
      ({ Given, And, But, When, Then }, { scenario }) => {
        const command = HelperCommandFixtures.aValidCommand();
        Given("an admin has valid helper information in scenario <scenario>", () => {});
        And("the helper account creation will succeed", () => {});
        But("the helper profile save will fail", () => {
          harness.simulateHelperRepositoryFailure();
        });
        When("the admin attempts to onboard the helper", async () => {
          await harness.onboardUser(command);
        });
        Then("the system rejects the request", async () => {
          await harness.assertHelperIsNotOnboarded(command.email);
        });
        And("the helper account is rolled back", async () => {
          await harness.assertHelperAccountDeleted(command.email);
        });
        And("no notification is sent", async () => {
          await harness.assertNotificationNotSent(command.email);
        });
      }
    );
  },
  {
    includeTags: ["unit"],
  }
);
