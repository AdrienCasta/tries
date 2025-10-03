import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { User } from "../domain/entities/User.js";
import SetupHelperPasswordUnderTest from "./sut/SetupHelperPasswordUnderTest.js";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(
  path.resolve(__dirname, "../../../features/setupHelperPassword.feature")
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

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario, ScenarioOutline }) => {
    let sut: SetupHelperPasswordUnderTest;
    let currentToken: string | null;
    let setupResult: { success: boolean; error?: string } | null;

    BeforeEachScenario(() => {
      sut = new SetupHelperPasswordUnderTest();
      sut.setup();
      currentToken = null;
      setupResult = null;
    });

    Scenario(
      `Helper successfully sets up password with valid token`,
      ({ Given, When, Then, And }) => {
        const email = "john@example.com";
        const password = "SecureP@ss123";

        Given(
          `a helper with email "john@example.com" has been onboarded`,
          async () => {
            await sut.onboardHelper(createUser(email, "John", "Doe"));
          }
        );

        And(`the helper has not set up a password yet`, async () => {
          expect(await sut.hasPasswordSet(email)).toBe(false);
        });

        And(`a valid password setup token exists`, async () => {
          currentToken = await sut.getPasswordSetupToken(email);
          expect(currentToken).not.toBeNull();
        });

        When(
          `the helper submits password "SecureP@ss123" with the token`,
          async () => {
            setupResult = await sut.setupPassword(currentToken!, password);
          }
        );

        Then(`the password should be set successfully`, async () => {
          expect(setupResult?.success).toBe(true);
        });

        And(`the helper can authenticate with the password`, async () => {
          expect(await sut.verifyPassword(email, password)).toBe(true);
        });

        And(`the password setup token should be invalidated`, async () => {
          const helper = await sut.getHelperByEmail(email);
          expect(helper?.passwordSetupToken).toBeUndefined();
        });
      }
    );

    ScenarioOutline(
      `Helper cannot set weak passwords`,
      ({ Given, When, Then, And }, { password, error }) => {
        const email = "weak@example.com";

        Given(`a helper with a valid password setup token`, async () => {
          await sut.onboardHelper(createUser(email, "Test", "User"));
          currentToken = await sut.getPasswordSetupToken(email);
        });

        When(
          `the helper submits password "<password>" with the token`,
          async () => {
            setupResult = await sut.setupPassword(currentToken!, password);
          }
        );

        Then(
          `the password setup should fail with error "<error>"`,
          async () => {
            expect(setupResult?.success).toBe(false);
            expect(setupResult?.error).toContain(error);
          }
        );

        And(`the helper should not have a password set`, async () => {
          expect(await sut.hasPasswordSet(email)).toBe(false);
        });
      }
    );

    Scenario(
      `Helper cannot use expired token`,
      ({ Given, When, Then, And }) => {
        const email = "expired@example.com";
        const password = "ValidP@ss123";

        Given(`a helper was onboarded 49 hours ago`, async () => {
          await sut.createHelperWithExpiredToken(
            createUser(email, "Expired", "User"),
            49
          );
        });

        And(`the helper has not set up a password yet`, async () => {
          expect(await sut.hasPasswordSet(email)).toBe(false);
        });

        When(
          `the helper attempts to set password with the expired token`,
          async () => {
            currentToken = await sut.getPasswordSetupToken(email);
            setupResult = await sut.setupPassword(currentToken!, password);
          }
        );

        Then(
          `the password setup should fail with error "Token expired"`,
          async () => {
            expect(setupResult?.success).toBe(false);
            expect(setupResult?.error).toBe("Token expired");
          }
        );

        And(`the helper should not have a password set`, async () => {
          expect(await sut.hasPasswordSet(email)).toBe(false);
        });
      }
    );

    Scenario(`Helper cannot use invalid token`, ({ Given, When, Then }) => {
      const email = "jane@example.com";
      const fakeToken = "fake-token-123";
      const password = "ValidP@ss123";

      Given(`a helper with email "jane@example.com" exists`, async () => {
        await sut.onboardHelper(createUser(email, "Jane", "Doe"));
      });

      When(
        `the helper attempts to set password with invalid token "fake-token-123"`,
        async () => {
          setupResult = await sut.setupPassword(fakeToken, password);
        }
      );

      Then(
        `the password setup should fail with error "Invalid token"`,
        async () => {
          expect(setupResult?.success).toBe(false);
          expect(setupResult?.error).toBe("Invalid token");
        }
      );
    });

    Scenario(
      `Helper cannot set password twice`,
      ({ Given, When, Then, And }) => {
        const email = "bob@example.com";
        const firstPassword = "FirstP@ss123";
        const newPassword = "NewP@ssword123";

        Given(
          `a helper with email "bob@example.com" has been onboarded`,
          async () => {
            await sut.onboardHelper(createUser(email, "Bob", "Smith"));
          }
        );

        And(`the helper has already set up their password`, async () => {
          await sut.setHelperPasswordDirectly(email, firstPassword);
          expect(await sut.hasPasswordSet(email)).toBe(true);
        });

        When(
          `the helper attempts to set password "NewP@ssword123" again`,
          async () => {
            currentToken = await sut.getPasswordSetupToken(email);
            // Token should be cleared when password was set
            setupResult = await sut.setupPassword(
              currentToken || "no-token",
              newPassword
            );
          }
        );

        Then(
          `the password setup should fail with error "Password already set"`,
          async () => {
            expect(setupResult?.success).toBe(false);
            expect(setupResult?.error).toBe("Password already set");
          }
        );
      }
    );
  }
);
