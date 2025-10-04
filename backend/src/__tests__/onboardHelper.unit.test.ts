import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { User } from "../domain/entities/User.js";
import OnboardHelperUnderTest from "./sut/OnboardHelperUnderTest.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(
  path.resolve(__dirname, "../../../features/onboardHelper.feature")
);

const createUser = (
  email: string,
  firstname: string,
  lastname: string
): User => ({
  email,
  firstname,
  lastname,
});

describeFeature(feature, ({ BeforeEachScenario, ScenarioOutline }) => {
  let sut: OnboardHelperUnderTest;

  BeforeEachScenario(() => {
    sut = new OnboardHelperUnderTest();
    sut.setup();
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
        await sut.assertNotificationNotSent(email);
      });
    }
  );
});
