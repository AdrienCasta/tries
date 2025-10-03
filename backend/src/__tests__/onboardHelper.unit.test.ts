import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { User } from "../domain/entities/User.js";
import OnboardHelperUnderTest from "./sut/OnboardHelperUnderTest.js";

import { fileURLToPath } from "url";
import path from "path";
import { Helper } from "../domain/entities/Helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(
  path.resolve(__dirname, "../../../features/onboardHelper.feature")
);

// Test helpers
const createUser = (
  email: string,
  firstname: string,
  lastname: string
): User => ({
  email,
  firstname,
  lastname,
});

const assertNotificationContains = async (
  sut: OnboardHelperUnderTest,
  email: string,
  expectedContent: string[]
) => {
  const content = await sut.getNotificationContent(email);
  expect(content).not.toBeNull();
  expectedContent.forEach((text) => {
    expect(content).toContain(text);
  });
};

const assertHelperNotOnboarded = async (
  sut: OnboardHelperUnderTest,
  email: string
) => {
  expect(await sut.isHelperOnboarded(email)).toBe(false);
  expect(await sut.hasReceivedNotification(email)).toBe(false);
};

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
          await sut.onboardUser(createUser(email, firstname, lastname));
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
      ({ Given, When, Then, And }, { email }) => {
        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "<email>"`, () => {});
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(createUser(email, "John", "Doe"));
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          await assertHelperNotOnboarded(sut, email);
        });

        And("the helper is not onboarded", async () => {
          await assertHelperNotOnboarded(sut, email);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid name information`,
      ({ Given, When, Then, And }, { firstname, lastname }) => {
        const email = "john@domain.com";

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "<firstname>"`, () => {});
        And(`the last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(createUser(email, firstname, lastname));
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          await assertHelperNotOnboarded(sut, email);
        });

        And("the helper is not onboarded", async () => {
          await assertHelperNotOnboarded(sut, email);
        });
      }
    );

    Scenario(
      `Admin cannot onboard helper with whitespace-only names`,
      ({ Given, When, Then, And }) => {
        const email = "john@domain.com";

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "   "`, () => {});
        And(`the last name is "Doe"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(createUser(email, "   ", "Doe"));
        });

        Then(
          `the onboarding fails with error "First name is required"`,
          async () => {
            await assertHelperNotOnboarded(sut, email);
          }
        );

        And("the helper is not onboarded", async () => {
          await assertHelperNotOnboarded(sut, email);
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
          await sut.onboardUser(createUser(email, "John", "Doe"));
        });

        Then(`the user should be onboarded as a helper`, async () => {
          expect(await sut.isHelperOnboarded(email)).toBe(true);
        });
      }
    );

    Scenario(
      `Admin onboards helper with maximum length valid data`,
      ({ Given, When, Then, And }) => {
        const email =
          "very.long.email.address.that.is.still.valid@extremely-long-domain-name.com";

        Given(
          `the user's email is "very.long.email.address.that.is.still.valid@extremely-long-domain-name.com"`,
          () => {}
        );
        And(`the user's first name is "Bartholomew"`, () => {});
        And(`the user's last name is "Montgomery-Smythe"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(
            createUser(email, "Bartholomew", "Montgomery-Smythe")
          );
        });

        Then(`the user should be onboarded as a helper`, async () => {
          expect(await sut.isHelperOnboarded(email)).toBe(true);
        });

        And(`the user should receive a notification`, async () => {
          expect(await sut.hasReceivedNotification(email)).toBe(true);
        });
      }
    );

    Scenario(
      `Admin onboards helper and receives personalized notification`,
      ({ Given, When, Then, And }) => {
        const email = "sarah.connor@example.com";

        Given(`the user's email is "sarah.connor@example.com"`, () => {});
        And(`the user's first name is "Sarah"`, () => {});
        And(`the user's last name is "Connor"`, () => {});

        When(`I onboard the user`, async () => {
          await sut.onboardUser(createUser(email, "Sarah", "Connor"));
        });

        Then(`the user should receive a notification`, async () => {
          expect(await sut.hasReceivedNotification(email)).toBe(true);
        });

        And(`the notification should contain "Hi Sarah Connor"`, async () => {
          await assertNotificationContains(sut, email, ["Hi Sarah Connor"]);
        });

        And(`the notification should contain "Welcome to Tries"`, async () => {
          await assertNotificationContains(sut, email, ["Welcome to Tries"]);
        });

        And(
          `the notification should contain "https://tries.fr/setup-password"`,
          async () => {
            await assertNotificationContains(sut, email, [
              "https://tries.fr/setup-password",
            ]);
          }
        );

        And(`the notification should contain "tries@support.fr"`, async () => {
          await assertNotificationContains(sut, email, ["tries@support.fr"]);
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard a helper who is already registered`,
      (
        { Given, When, Then, And },
        { email, firstname, lastname, otherUserFirstname, otherUserLastname }
      ) => {
        const originalUser = createUser(email, firstname, lastname);
        const duplicateUser = createUser(
          email,
          otherUserFirstname,
          otherUserLastname
        );

        Given(
          `a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded`,
          async () => {
            const result = await sut.onboardUser(originalUser);
            expect(result.success).toBe(true);
          }
        );

        When(
          `I attempt to onboard another helper "<otherUserFirstname>" "<otherUserLastname>" with same email`,
          async () => {
            sut.clearNotification();
          }
        );

        Then(`the onboarding should fail`, async () => {
          const result = await sut.onboardUser(duplicateUser);
          expect(result.success).toBe(false);
        });

        And(`the helper should not be duplicated`, async () => {
          const helper = (await sut.findHelperByEmail(email)) as Helper;

          expect({
            firstname: helper.firstname.value,
            lastname: helper.lastname.value,
            email: helper.email.value,
          }).toStrictEqual(originalUser);
        });

        And(
          `no notification should be sent for the duplicate attempt`,
          async () => {
            expect(await sut.hasReceivedNotification(email)).toBe(false);
          }
        );
      }
    );
  }
);
