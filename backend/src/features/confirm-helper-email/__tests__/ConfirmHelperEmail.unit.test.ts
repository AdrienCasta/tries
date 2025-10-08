import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import ConfirmHelperEmailUnderTest from "./ConfirmHelperEmailUnderTest.js";
import { ConfirmHelperEmailCommandFixtures } from "./fixtures/ConfirmHelperEmailCommandFixtures.js";

// @ts-ignore
import featureContent from "../../../../../features/confirmEmail.feature?raw";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  INVALID_TOKEN_FORMAT: "INVALID_TOKEN_FORMAT",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  EMAIL_ALREADY_CONFIRMED: "EMAIL_ALREADY_CONFIRMED",
};

setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, ScenarioOutline, Scenario }) => {
    let sut: ConfirmHelperEmailUnderTest;

    BeforeEachScenario(() => {
      sut = new ConfirmHelperEmailUnderTest();
      sut.setup();
    });

    Scenario(
      `Successfully confirm email with valid token`,
      ({ Given, When, Then, And }) => {
        const token = "valid-token-abc123def456ghi789";

        Given(`a helper account exists with unconfirmed email`, () => {
          sut.givenTokenExists(token);
        });

        When(`I confirm my email with a valid token`, async () => {
          await sut.confirmEmail(
            ConfirmHelperEmailCommandFixtures.aValidCommand({ token })
          );
        });

        Then(`my email should be confirmed`, async () => {
          await sut.assertConfirmationSucceeded();
        });

        And(`my account should be activated`, async () => {
          await sut.assertConfirmationSucceeded();
        });
      }
    );

    ScenarioOutline(
      `Cannot confirm email with invalid token format`,
      ({ Given, When, Then, And }, { token, error: errorCode }) => {
        Given(`a helper account exists with unconfirmed email`, () => {});

        When(`I confirm my email with token "<token>"`, async () => {
          await sut.confirmEmail(
            ConfirmHelperEmailCommandFixtures.withToken(token)
          );
        });

        Then(`the confirmation should fail with error "<error>"`, async () => {
          await sut.assertConfirmationFailedWithError(errorCode);
        });

        And(`my email should not be confirmed`, async () => {
          await sut.assertConfirmationFailed();
        });
      }
    );

    Scenario(
      `Cannot confirm email with expired token`,
      ({ Given, When, Then, And }) => {
        const token = "valid-token-abc123def456ghi789";

        Given(`a helper account exists with unconfirmed email`, () => {
          sut.givenTokenExists(token);
        });

        And(`the email confirmation token has expired`, () => {
          sut.givenTokenExpired(token);
        });

        When(`I confirm my email with the expired token`, async () => {
          await sut.confirmEmail(
            ConfirmHelperEmailCommandFixtures.aValidCommand({ token })
          );
        });

        Then(
          `the confirmation should fail with error "TOKEN_EXPIRED"`,
          async () => {
            await sut.assertConfirmationFailedWithError("TOKEN_EXPIRED");
          }
        );

        And(`my email should not be confirmed`, async () => {
          await sut.assertConfirmationFailed();
        });
      }
    );

    Scenario(
      `Cannot confirm already confirmed email`,
      ({ Given, When, Then }) => {
        const token = "valid-token-abc123def456ghi789";

        Given(`a helper account exists with confirmed email`, () => {
          sut.givenTokenExists(token);
          sut.givenEmailAlreadyConfirmed(token);
        });

        When(`I attempt to confirm my email again`, async () => {
          await sut.confirmEmail(
            ConfirmHelperEmailCommandFixtures.aValidCommand({ token })
          );
        });

        Then(
          `the confirmation should fail with error "EMAIL_ALREADY_CONFIRMED"`,
          async () => {
            await sut.assertConfirmationFailedWithError(
              "EMAIL_ALREADY_CONFIRMED"
            );
          }
        );
      }
    );
  }
);
