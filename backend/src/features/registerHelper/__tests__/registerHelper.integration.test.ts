import { expect } from "vitest";
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { FastifyHttpServer } from "@infrastructure/http/FastifyHttpServer";
import { SupabaseTestHelper } from "@__tests__/helpers/SupabaseTestHelper";
import { SupabaseHelperRepository } from "@infrastructure/persistence/SupabaseHelperRepository";
import { SupabaseAuthRepository } from "@infrastructure/persistence/SupabaseAuthRepository";
import { SupabaseAuthUserRepository } from "@infrastructure/persistence/SupabaseAuthUserRepository";
import { SupabaseOnboardedHelperNotificationService } from "@infrastructure/notifications/SupabaseOnboardedHelperNotificationService";
import { SupabaseEmailConfirmationService } from "@infrastructure/services/SupabaseEmailConfirmationService";
import { SystemClock } from "@infrastructure/time/SystemClock";
import InMemoryEventBus from "@infrastructure/events/InMemoryEventBus";
import { createApp } from "@app/createApp";
import { EmailFixtures } from "@shared/__tests__/fixtures/EmailFixtures";

// @ts-ignore
import featureContent from "../../../../../features/registerHelper.integration.feature?raw";

const feature = await loadFeatureFromText(featureContent);

interface IntegrationTestContext {
  server: FastifyHttpServer;
  supabaseHelper: SupabaseTestHelper;
  testEmail: string;
  response?: Awaited<ReturnType<typeof FastifyHttpServer.prototype.inject>>;
}

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, Scenario, Background }) => {
    const context: IntegrationTestContext = {} as IntegrationTestContext;

    BeforeEachScenario(async () => {
      context.testEmail = EmailFixtures.aRandomEmail();
      context.supabaseHelper = new SupabaseTestHelper();
      const supabase = context.supabaseHelper.getClient();

      const dependencies = {
        helperRepository: new SupabaseHelperRepository(supabase),
        helperAccountRepository: new SupabaseAuthRepository(supabase),
        authUserRepository: new SupabaseAuthUserRepository(supabase),
        notificationService: new SupabaseOnboardedHelperNotificationService(
          supabase
        ),
        emailConfirmationService: new SupabaseEmailConfirmationService(
          supabase
        ),
        clock: new SystemClock(),
        eventBus: new InMemoryEventBus(),
      };

      context.server = new FastifyHttpServer();
      createApp(context.server, dependencies);
      await context.server.ready();
    });

    AfterEachScenario(async () => {
      await context.supabaseHelper.deleteUserByEmail(context.testEmail);
      await context.supabaseHelper.cleanup();
      await context.server.close();
    });

    Background(({ Given }) => {
      Given(
        "I am healthcare professional wishing to become an helper",
        () => {}
      );
    });

    Scenario("Helper register successfully", ({ When, Then, And }) => {
      When("I submit my information", async () => {
        const payload = {
          email: context.testEmail,
          password: "SecureP@ss123!",
          firstname: "John",
          lastname: "Doe",
          phoneNumber: "+33612345678",
          birthdate: "1990-01-01",
          placeOfBirth: {
            country: "FR",
            city: "Paris",
          },
          professions: [
            {
              code: "physiotherapist",
              healthId: { rpps: "12345678901" },
            },
          ],
          residence: {
            country: "FR",
            frenchAreaCode: "75",
          },
        };

        context.response = await context.server.inject({
          method: "POST",
          url: "/api/helpers/register",
          payload,
        });
      });

      Then("I am notified it went well", () => {
        expect(context.response?.statusCode).toBe(201);

        const body = context.response?.json();
        expect(body).toHaveProperty("message");
        expect(body.message).toContain("successfully");
      });

      And("notified I have to confirm my email", async () => {
        const user = await context.supabaseHelper.getUserByEmail(
          context.testEmail
        );
        expect(user).toBeDefined();
        expect(user?.email).toBe(context.testEmail);
        expect(user?.email_confirmed_at).toBeFalsy();
      });
    });
  }
);
