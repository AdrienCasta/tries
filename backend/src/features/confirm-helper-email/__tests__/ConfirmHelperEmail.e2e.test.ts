import { loadFeatureFromText, describeFeature } from "@amiceli/vitest-cucumber";
import ConfirmHelperEmailE2ETest from "./ConfirmHelperEmailE2ETest.js";

// @ts-ignore
import featureContent from "../../../../../features/confirmEmail.feature?raw";
const feature = await loadFeatureFromText(featureContent);

describeFeature(feature, ({ BeforeEachScenario, AfterEachScenario, Scenario, ScenarioOutline }) => {
  let sut: ConfirmHelperEmailE2ETest;

  BeforeEachScenario(async () => {
    sut = new ConfirmHelperEmailE2ETest();
    await sut.setup();
  });

  AfterEachScenario(async () => {
    await sut.teardown();
  });

  Scenario(`Successfully confirm email with valid token`, ({ Given, When, Then, And }) => {
    const email = "test-confirm@example.com";

    Given(`a helper account exists with unconfirmed email`, async () => {
      await sut.createHelperWithUnconfirmedEmail(email);
    });

    When(`I confirm my email with a valid token`, async () => {
      await sut.confirmEmail(sut.getValidToken());
    });

    Then(`my email should be confirmed`, async () => {
      await sut.assertEmailConfirmed();
    });

    And(`my account should be activated`, async () => {
      await sut.assertEmailIsConfirmedInDatabase(email);
    });
  });

  ScenarioOutline(
    `Cannot confirm email with invalid token format`,
    ({ Given, When, Then, And }, { token, error }) => {
      const email = "test-invalid-token@example.com";

      Given(`a helper account exists with unconfirmed email`, async () => {
        await sut.createHelperWithUnconfirmedEmail(email);
      });

      When(`I confirm my email with token "<token>"`, async () => {
        await sut.confirmEmail(token);
      });

      Then(`the confirmation should fail with error "<error>"`, async () => {
        await sut.assertConfirmationFailed(error);
      });

      And(`my email should not be confirmed`, async () => {
        await sut.assertEmailNotConfirmed(email);
      });
    }
  );

  Scenario(`Cannot confirm email with expired token`, ({ Given, When, Then, And }) => {
    const email = "test-expired@example.com";

    Given(`a helper account exists with unconfirmed email`, async () => {
      await sut.createHelperWithUnconfirmedEmail(email);
    });

    And(`the email confirmation token has expired`, () => {});

    When(`I confirm my email with the expired token`, async () => {
      await sut.confirmEmail(sut.getExpiredToken());
    });

    Then(`the confirmation should fail with error "TOKEN_EXPIRED"`, async () => {
      await sut.assertConfirmationFailed("TOKEN_EXPIRED");
    });

    And(`my email should not be confirmed`, async () => {
      await sut.assertEmailNotConfirmed(email);
    });
  });

  Scenario(`Cannot confirm already confirmed email`, ({ Given, When, Then }) => {
    const email = "test-already-confirmed@example.com";

    Given(`a helper account exists with confirmed email`, async () => {
      await sut.createHelperWithConfirmedEmail(email);
    });

    When(`I attempt to confirm my email again`, async () => {
      await sut.confirmEmail(sut.getValidToken());
    });

    Then(`the confirmation should fail with error "EMAIL_ALREADY_CONFIRMED"`, async () => {
      await sut.assertConfirmationFailed("EMAIL_ALREADY_CONFIRMED");
    });
  });
}, { includeTags: ["e2e"] });
