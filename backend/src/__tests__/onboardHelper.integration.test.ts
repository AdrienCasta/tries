import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { OnboardHelper } from "../application/use-cases/OnboardHelper.js";
import { SupabaseHelperRepository } from "../infrastructure/repositories/SupabaseHelperRepository.js";
import { SupabaseHelperAccountRepository } from "../infrastructure/repositories/SupabaseHelperAccountRepository.js";
import { SupabaseOnboardedHelperNotificationService } from "../infrastructure/services/SupabaseOnboardedHelperNotificationService.js";
import { FixedClock } from "./doubles/FixedClock.js";
import { User } from "../domain/entities/User.js";
import InvalidEmailError from "../domain/errors/InvalidEmailError.js";
import ValidationError from "../domain/errors/ValidationError.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(
  path.resolve(__dirname, "../../../features/onboardHelper.feature")
);

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, ScenarioOutline }) => {
    let supabase: SupabaseClient;
    let onboardHelper: OnboardHelper;
    let notificationService: SupabaseOnboardedHelperNotificationService;
    let testEmails: string[] = [];

    BeforeEachScenario(() => {
      supabase = createSupabaseClient();

      const helperRepository = new SupabaseHelperRepository(supabase);
      const helperAccountRepository = new SupabaseHelperAccountRepository(
        supabase
      );
      notificationService = new SupabaseOnboardedHelperNotificationService(
        supabase
      );
      notificationService.send = vi.fn();
      const clock = new FixedClock(new Date("2025-01-15T10:00:00Z"));

      onboardHelper = new OnboardHelper(
        helperRepository,
        helperAccountRepository,
        notificationService,
        clock
      );
    });

    AfterEachScenario(async () => {
      for (const email of testEmails) {
        await cleanupHelper(supabase, email);
      }
      testEmails = [];
    });

    ScenarioOutline(
      `Admin successfully onboards a new helper with valid information`,
      ({ Given, When, Then, And }, { email, lastname, firstname }) => {
        Given(`the user's email is "<email>"`, () => {
          testEmails.push(email);
        });

        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          await onboardHelper.execute(createUser(email, firstname, lastname));
        });

        Then(`the user should be onboarded as a helper`, async () => {
          await verifyHelperInDatabase(supabase, email, firstname, lastname);
        });

        And(`the user should receive a notification`, async () => {
          await verifyHelperAccountInAuth(supabase, email);
          expect(notificationService.send).toHaveBeenCalledOnce();
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid email address`,
      ({ Given, When, Then, And }, { email, error }) => {
        let lastError: Error | null = null;

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "<email>"`, () => {
          testEmails.push(email);
        });
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});

        When(`I onboard the user`, async () => {
          const result = await onboardHelper.execute(
            createUser(email, "John", "Doe")
          );
          if (!result.success) {
            lastError = result.error;
          }
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          verifyOnboardingFailedWithInvalidEmail(lastError, error);
        });

        And(`the helper is not onboarded`, async () => {
          await verifyHelperNotInDatabase(supabase, email);
          await verifyNoHelperAccountInAuth(supabase, email);
          expect(notificationService.send).not.toHaveBeenCalled();
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid name information`,
      ({ Given, When, Then, And }, { firstname, lastname, error }) => {
        const email = "john@domain.com";
        let lastError: Error | null = null;

        Given(`I am onboarding a new helper`, () => {});
        And(`the email address is "john@domain.com"`, () => {
          testEmails.push(email);
        });
        And(`the first name is "<firstname>"`, () => {});
        And(`the last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          const result = await onboardHelper.execute(
            createUser(email, firstname, lastname)
          );
          if (!result.success) {
            lastError = result.error;
          }
        });

        Then(`the onboarding fails with error "<error>"`, async () => {
          verifyOnboardingFailedWithNameValidation(lastError, error);
        });

        And(`the helper is not onboarded`, async () => {
          await verifyHelperNotInDatabase(supabase, email);
          await verifyNoHelperAccountInAuth(supabase, email);
          expect(notificationService.send).not.toHaveBeenCalled();
        });
      }
    );

    ScenarioOutline(
      `Admin cannot onboard a helper who is already registered`,
      (
        { Given, When, Then, And },
        { email, firstname, lastname, otherUserFirstname, otherUserLastname }
      ) => {
        let lastError: Error | null = null;

        Given(
          `a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded`,
          async () => {
            testEmails.push(email);
            await onboardHelper.execute(createUser(email, firstname, lastname));
          }
        );

        When(
          `I attempt to onboard another helper "<otherUserFirstname>" "<otherUserLastname>" with same email`,
          async () => {
            const result = await onboardHelper.execute(
              createUser(email, otherUserFirstname, otherUserLastname)
            );
            if (!result.success) {
              lastError = result.error;
            }
          }
        );

        Then(`the onboarding should fail`, async () => {
          await verifyOnboardingFailedWithDuplicateEmail(lastError);
        });

        And(`the helper should not be duplicated`, async () => {
          await verifyHelperDetailsNotChanged(
            supabase,
            email,
            firstname,
            lastname
          );
        });

        And(
          `no notification should be sent for the duplicate attempt`,
          async () => {
            await verifyOnlyOneNotificationSent(notificationService);
          }
        );
      }
    );
  }
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

const createSupabaseClient = () =>
  createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

const cleanupHelper = async (supabase: SupabaseClient, email: string) => {
  try {
    const { data } = await supabase.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === email);
    if (user) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  } catch (error) {
    console.error(`Cleanup Auth failed for ${email}:`, error);
  }

  try {
    await supabase.from("helpers").delete().eq("email", email);
  } catch (error) {
    console.error(`Cleanup helpers table failed for ${email}:`, error);
  }
};

const verifyHelperInDatabase = async (
  supabase: SupabaseClient,
  email: string,
  firstname: string,
  lastname: string
) => {
  const { data: helper } = await supabase
    .from("helpers")
    .select("*")
    .eq("email", email)
    .single();

  expect(helper).toBeDefined();
  expect(helper.email).toBe(email);
  expect(helper.firstname).toBe(firstname);
  expect(helper.lastname).toBe(lastname);
};

const verifyHelperAccountInAuth = async (
  supabase: SupabaseClient,
  email: string
) => {
  const { data: authData } = await supabase.auth.admin.listUsers();
  const authUser = authData.users.find((u) => u.email === email);

  expect(authUser).toBeDefined();
  expect(authUser?.email).toBe(email);
};

const verifyOnboardingFailedWithInvalidEmail = (
  error: Error | null,
  expectedErrorMessage: string
) => {
  expect(error).toBeInstanceOf(InvalidEmailError);
  expect(error?.message).toBe(expectedErrorMessage);
};

const verifyOnboardingFailedWithNameValidation = (
  error: Error | null,
  expectedErrorMessage: string
) => {
  expect(error).toBeInstanceOf(ValidationError);
  expect(error?.message).toBe(expectedErrorMessage);
};

const verifyHelperNotInDatabase = async (
  supabase: SupabaseClient,
  email: string
) => {
  const { data: helper } = await supabase
    .from("helpers")
    .select("*")
    .eq("email", email)
    .single();

  expect(helper).toBeNull();
};

const verifyNoHelperAccountInAuth = async (
  supabase: SupabaseClient,
  email: string
) => {
  const { data: authData } = await supabase.auth.admin.listUsers();
  const authUser = authData.users.find((u) => u.email === email);

  expect(authUser).toBeUndefined();
};

const verifyOnboardingFailedWithDuplicateEmail = async (
  error: Error | null
) => {
  expect(error).toBeDefined();
  expect(error?.message).toBe("Helper with this email already exists");
};

const verifyHelperDetailsNotChanged = async (
  supabase: SupabaseClient,
  email: string,
  expectedFirstname: string,
  expectedLastname: string
) => {
  const { data: helper } = await supabase
    .from("helpers")
    .select("*")
    .eq("email", email)
    .single();

  expect(helper).toBeDefined();
  expect(helper.firstname).toBe(expectedFirstname);
  expect(helper.lastname).toBe(expectedLastname);
};

const verifyOnlyOneNotificationSent = async (
  notificationService: SupabaseOnboardedHelperNotificationService
) => {
  expect(notificationService.send).toHaveBeenCalledOnce();
};
