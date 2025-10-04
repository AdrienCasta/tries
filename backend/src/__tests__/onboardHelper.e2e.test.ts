import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { HttpServer } from "../presentation/http/HttpServer.js";
import { createApp } from "../presentation/http/createApp.js";
import { FastifyHttpServer } from "../infrastructure/http/FastifyHttpServer.js";
import { SupabaseHelperRepository } from "../infrastructure/repositories/SupabaseHelperRepository.js";
import { SupabaseHelperAccountRepository } from "../infrastructure/repositories/SupabaseHelperAccountRepository.js";
import { SupabaseOnboardedHelperNotificationService } from "../infrastructure/services/SupabaseOnboardedHelperNotificationService.js";
import { FixedClock } from "./doubles/FixedClock.js";
import { InMemoryEventBus } from "./doubles/InMemoryEventBus.js";
import { fileURLToPath } from "url";
import path from "path";

/**
 * E2E TESTS - CRITICAL SCENARIOS ONLY
 *
 * These tests verify the COMPLETE stack with real infrastructure:
 * - Real Fastify HTTP server
 * - Real HTTP requests/responses
 * - Real Supabase database persistence
 * - Real Supabase authentication
 * - Transaction atomicity with real infrastructure
 *
 * Comprehensive scenario coverage is provided by:
 * - Unit tests (business logic with test doubles)
 * - Integration tests (HTTP layer with in-memory repositories)
 *
 * E2E tests focus on critical paths that require real infrastructure validation.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(
  path.resolve(__dirname, "../../../features/onboardHelper.feature")
);

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, ScenarioOutline, Scenario }) => {
    let server: HttpServer;
    let supabase: SupabaseClient;
    let notificationService: SupabaseOnboardedHelperNotificationService;
    let testEmails: string[] = [];

    BeforeEachScenario(async () => {
      supabase = createSupabaseClient();

      const helperRepository = new SupabaseHelperRepository(supabase);
      const helperAccountRepository = new SupabaseHelperAccountRepository(
        supabase
      );
      notificationService = new SupabaseOnboardedHelperNotificationService(
        supabase
      );
      // Mock email sending in E2E - we test HTTP + DB, not actual email delivery
      notificationService.send = vi.fn();
      const clock = new FixedClock(new Date("2025-01-15T10:00:00Z"));

      const fastifyServer = new FastifyHttpServer();
      server = createApp(fastifyServer, {
        helperRepository,
        helperAccountRepository,
        notificationService,
        clock,
        eventBus: new InMemoryEventBus(),
      });

      await server.ready();
    });

    AfterEachScenario(async () => {
      await server.close();
      for (const email of testEmails) {
        await cleanupHelper(supabase, email);
      }
      testEmails = [];
    });

    /**
     * CRITICAL E2E SCENARIO #1: Happy Path
     * Verifies complete onboarding flow with real HTTP + real database
     * Tests only one representative example from each category
     */
    ScenarioOutline(
      `Admin successfully onboards a new helper with valid information`,
      ({ Given, When, Then, And }, { email, lastname, firstname }) => {
        let response: any;

        Given(`the user's email is "<email>"`, () => {
          testEmails.push(email);
        });

        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});

        When(`I onboard the user`, async () => {
          response = await server.inject({
            method: "POST",
            url: "/api/helpers/onboard",
            payload: { email, firstname, lastname },
          });
        });

        Then(`the user should be onboarded as a helper`, async () => {
          expect(response.statusCode).toBe(201);
          const body = response.json();
          expect(body.helperId).toBeDefined();
          await verifyHelperInDatabase(supabase, email, firstname, lastname);
        });

        And(`the user should receive a notification`, async () => {
          await verifyHelperAccountInAuth(supabase, email);
          expect(notificationService.send).toHaveBeenCalledOnce();
        });
      }
    );

    /**
     * CRITICAL E2E SCENARIO #2: Duplicate Prevention
     * Verifies database constraints prevent duplicate helpers via real HTTP
     * Critical for data integrity
     */
    ScenarioOutline(
      `Admin cannot onboard a helper who is already registered`,
      (
        { Given, When, Then, And },
        { email, firstname, lastname, otherUserFirstname, otherUserLastname }
      ) => {
        let response: any;

        Given(
          `a helper "<firstname>" "<lastname>" with email "<email>" is already onboarded`,
          async () => {
            testEmails.push(email);
            await server.inject({
              method: "POST",
              url: "/api/helpers/onboard",
              payload: { email, firstname, lastname },
            });
          }
        );

        When(
          `I attempt to onboard another helper "<otherUserFirstname>" "<otherUserLastname>" with same email`,
          async () => {
            response = await server.inject({
              method: "POST",
              url: "/api/helpers/onboard",
              payload: {
                email,
                firstname: otherUserFirstname,
                lastname: otherUserLastname,
              },
            });
          }
        );

        Then(`the onboarding should fail`, async () => {
          expect(response.statusCode).toBe(400);
          await verifyOnboardingFailedWithDuplicateEmail(response);
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

    /**
     * VALIDATION & SYSTEM UNAVAILABILITY SCENARIOS - SKIPPED IN E2E
     *
     * The following scenarios are intentionally NOT tested at E2E level:
     *
     * 1. Invalid email validation
     * 2. Invalid name validation
     * 3. System temporarily unavailable
     *
     * Rationale:
     * - Validation logic is thoroughly tested in unit tests
     * - System failures cannot be reliably simulated with real infrastructure
     * - Integration tests provide HTTP-level validation coverage
     * - E2E tests should focus on critical data integrity scenarios
     */
    ScenarioOutline(
      `Admin cannot onboard helper with invalid email address`,
      ({ Given, When, Then, And }, { email, error }) => {
        Given(`I am onboarding a new helper`, () => {
          // Skipped - covered by unit and integration tests
        });
        And(`the email address is "<email>"`, () => {});
        And(`the first name is "John"`, () => {});
        And(`the last name is "Doe"`, () => {});
        When(`I onboard the user`, () => {});
        Then(`the onboarding fails with error "<error>"`, () => {});
        And(`the helper is not onboarded`, () => {});
      }
    );

    ScenarioOutline(
      `Admin cannot onboard helper with invalid name information`,
      ({ Given, When, Then, And }, { firstname, lastname, error }) => {
        Given(`I am onboarding a new helper`, () => {
          // Skipped - covered by unit and integration tests
        });
        And(`the email address is "john@domain.com"`, () => {});
        And(`the first name is "<firstname>"`, () => {});
        And(`the last name is "<lastname>"`, () => {});
        When(`I onboard the user`, () => {});
        Then(`the onboarding fails with error "<error>"`, () => {});
        And(`the helper is not onboarded`, () => {});
      }
    );

    Scenario(
      `Admin cannot onboard helper when system is temporarily unavailable`,
      ({ Given, When, Then, And }) => {
        Given(`I am onboarding a new helper with valid information`, () => {
          // Skipped - cannot simulate real infrastructure failure
        });
        And(`the system is temporarily unavailable`, () => {});
        When(`I attempt to onboard the user`, () => {});
        Then(`the onboarding should fail`, () => {});
        And(`the helper should not be onboarded`, () => {});
        And(`no notification should be sent`, () => {});
      }
    );
  }
);

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

const verifyOnboardingFailedWithDuplicateEmail = async (response: any) => {
  const body = response.json();
  expect(body.error).toBe("Helper with this email already exists");
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
