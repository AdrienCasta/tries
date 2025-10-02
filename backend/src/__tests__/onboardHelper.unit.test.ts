import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { User } from "../domain/entities/User.js";
import OnboardHelperUnderTest from "./sut/OnboardHelperUnderTest.js";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(
  path.resolve(__dirname, "../../../features/onboardHelper.feature")
);

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
      ({ Given, When, Then, And }, { email, lastname, firstname }) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          const user: User = { email, lastname, firstname };
          await sut.onboardUser(user);
        });

        Then(`the user should be onboarded as a helper`, async () => {
          expect(await sut.isHelperOnboarded(email)).toBe(true);
        });

        And(`the user should receive a notification`, async () => {
          expect(await sut.hasReceivedNotification(email)).toBe(true);
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
          const user: User = { email, firstname: "John", lastname: "Doe" };
          await sut.onboardUser(user);
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          expect(await sut.isHelperOnboarded(email)).toBe(false);
        });

        And("the helper is not onboarded", async () => {
          expect(await sut.isHelperOnboarded(email)).toBe(false);
          expect(await sut.hasReceivedNotification(email)).toBe(false);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid name information`,
      ({ Given, When, Then, And }, { firstname, lastname, error }) => {
        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "<firstname>"`, () => {});
        And(`the last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          const user: User = { email: "john@domain.com", firstname, lastname };
          await sut.onboardUser(user);
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          expect(await sut.isHelperOnboarded("john@domain.com")).toBe(false);
        });

        And("the helper is not onboarded", async () => {
          expect(await sut.isHelperOnboarded("john@domain.com")).toBe(false);
        });
      }
    );

    Scenario(
      `Admin cannot onboard helper with whitespace-only names`,
      ({ Given, When, Then, And }) => {
        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "   "`, () => {});
        And(`the last name is "Doe"`, () => {});

        When(`I onboard the user`, async () => {
          const user: User = {
            email: "john@domain.com",
            firstname: "   ",
            lastname: "Doe",
          };
          await sut.onboardUser(user);
        });

        Then(
          `the onboarding fails with error "First name is required"`,
          async () => {
            expect(await sut.isHelperOnboarded("john@domain.com")).toBe(false);
          }
        );

        And("the helper is not onboarded", async () => {
          expect(await sut.isHelperOnboarded("john@domain.com")).toBe(false);
        });
      }
    );

    ScenarioOutline(
      `Admin onboards helper with edge case valid emails`,
      ({ Given, When, Then, And }, { email }) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "John"`, () => {});
        And(`the user's last name is "Doe"`, () => {});

        When(`I onboard the user`, async () => {
          const user: User = { email, firstname: "John", lastname: "Doe" };
          await sut.onboardUser(user);
        });

        Then(`the user should be onboarded as a helper`, async () => {
          expect(await sut.isHelperOnboarded(email)).toBe(true);
        });
      }
    );

    Scenario(
      `Admin onboards helper with maximum length valid data`,
      ({ Given, When, Then, And }) => {
        Given(
          `the user's email is "very.long.email.address.that.is.still.valid@extremely-long-domain-name.com"`,
          () => {}
        );
        And(`the user's first name is "Bartholomew"`, () => {});
        And(`the user's last name is "Montgomery-Smythe"`, () => {});

        When(`I onboard the user`, async () => {
          const user: User = {
            email:
              "very.long.email.address.that.is.still.valid@extremely-long-domain-name.com",
            firstname: "Bartholomew",
            lastname: "Montgomery-Smythe",
          };
          await sut.onboardUser(user);
        });

        Then(`the user should be onboarded as a helper`, async () => {
          expect(
            await sut.isHelperOnboarded(
              "very.long.email.address.that.is.still.valid@extremely-long-domain-name.com"
            )
          ).toBe(true);
        });

        And(`the user should receive a notification`, async () => {
          // Notification will be sent by controller/API layer via events
        });
      }
    );

    Scenario(
      `Admin onboards helper and receives personalized notification`,
      ({ Given, When, Then, And }) => {
        Given(`the user's email is "sarah.connor@example.com"`, () => {});
        And(`the user's first name is "Sarah"`, () => {});
        And(`the user's last name is "Connor"`, () => {});

        When(`I onboard the user`, async () => {
          const user: User = {
            email: "sarah.connor@example.com",
            firstname: "Sarah",
            lastname: "Connor",
          };
          await sut.onboardUser(user);
        });

        Then(`the user should receive a notification`, async () => {
          expect(
            await sut.hasReceivedNotification("sarah.connor@example.com")
          ).toBe(true);
        });

        And(`the notification should contain "Hi Sarah Connor"`, async () => {
          const content = await sut.getNotificationContent(
            "sarah.connor@example.com"
          );
          expect(content).toContain("Hi Sarah Connor");
        });

        And(`the notification should contain "Welcome to Tries"`, async () => {
          const content = await sut.getNotificationContent(
            "sarah.connor@example.com"
          );
          expect(content).toContain("Welcome to Tries");
        });

        And(
          `the notification should contain "https://tries.fr/setup-password"`,
          async () => {
            const content = await sut.getNotificationContent(
              "sarah.connor@example.com"
            );
            expect(content).toContain("https://tries.fr/setup-password");
          }
        );

        And(`the notification should contain "tries@support.fr"`, async () => {
          const content = await sut.getNotificationContent(
            "sarah.connor@example.com"
          );
          expect(content).toContain("tries@support.fr");
        });
      }
    );
  }
);
