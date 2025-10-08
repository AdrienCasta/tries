import {
  loadFeatureFromText,
  describeFeature,
  setVitestCucumberConfiguration,
  getVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import ConfirmHelperEmailIntegrationTest from "./ConfirmHelperEmailIntegrationTest.js";

// @ts-ignore
import featureContent from "../../../../../features/confirmEmail.feature?raw";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "INVALID_TOKEN_FORMAT": {
    statusCode: 400,
    errorBody: { code: "INVALID_TOKEN_FORMAT" },
  },
  "TOKEN_EXPIRED": {
    statusCode: 400,
    errorBody: { code: "TOKEN_EXPIRED" },
  },
  "EMAIL_ALREADY_CONFIRMED": {
    statusCode: 400,
    errorBody: { code: "EMAIL_ALREADY_CONFIRMED" },
  },
};

setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, ScenarioOutline, Scenario }) => {
    let sut: ConfirmHelperEmailIntegrationTest;

    BeforeEachScenario(async () => {
      sut = new ConfirmHelperEmailIntegrationTest();
      await sut.setup();
    });

    AfterEachScenario(async () => {
      await sut.teardown();
    });

    Scenario(
      `Successfully confirm email with valid token`,
      ({ Given, When, Then, And }) => {
        const email = "helper@example.com";

        Given(`a helper account exists with unconfirmed email`, () => {
          sut.givenHelperAccountExists(email);
        });

        When(`I confirm my email with a valid token`, async () => {
          await sut.confirmEmailWithToken(sut.getValidToken());
        });

        Then(`my email should be confirmed`, async () => {
          await sut.assertEmailConfirmed();
        });

        And(`my account should be activated`, async () => {
          await sut.assertEmailConfirmed();
        });
      }
    );

    ScenarioOutline(
      `Cannot confirm email with invalid token format`,
      ({ Given, When, Then, And }, { token, error: errorCode }) => {
        const email = "helper@example.com";

        Given(`a helper account exists with unconfirmed email`, () => {
          sut.givenHelperAccountExists(email);
        });

        When(`I confirm my email with token "<token>"`, async () => {
          await sut.confirmEmailWithToken(token);
        });

        Then(`the confirmation should fail with error "<error>"`, async () => {
          await sut.assertConfirmationFailed(400, errorCode.errorBody.code);
        });

        And(`my email should not be confirmed`, () => {});
      }
    );

    Scenario(
      `Cannot confirm email with expired token`,
      ({ Given, When, Then, And }) => {
        const email = "helper@example.com";

        Given(`a helper account exists with unconfirmed email`, () => {
          sut.givenHelperAccountExists(email);
        });

        And(`the email confirmation token has expired`, () => {
          sut.givenTokenIsExpired();
        });

        When(`I confirm my email with the expired token`, async () => {
          await sut.confirmEmailWithToken(sut.getValidToken());
        });

        Then(`the confirmation should fail with error "TOKEN_EXPIRED"`, async () => {
          await sut.assertConfirmationFailed(400, "TOKEN_EXPIRED");
        });

        And(`my email should not be confirmed`, () => {});
      }
    );

    Scenario(
      `Cannot confirm already confirmed email`,
      ({ Given, When, Then }) => {
        const email = "helper@example.com";

        Given(`a helper account exists with confirmed email`, () => {
          sut.givenHelperAccountExists(email);
          sut.givenEmailAlreadyConfirmed();
        });

        When(`I attempt to confirm my email again`, async () => {
          await sut.confirmEmailWithToken(sut.getValidToken());
        });

        Then(`the confirmation should fail with error "EMAIL_ALREADY_CONFIRMED"`, async () => {
          await sut.assertConfirmationFailed(400, "EMAIL_ALREADY_CONFIRMED");
        });
      }
    );
  }
);
