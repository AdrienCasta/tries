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
import RegisterHelperRequestFixture from "@features/registerHelper/__tests__/fixtures/RegisterHelperRequestFixture";

// @ts-ignore
import featureContent from "../../../../../features/confirmEmail.feature?raw";

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
      Given("I am a helper who registered on the platform", () => {});
    });

    Scenario(
      "Successfully confirm email with valid token",
      ({ Given, When, Then, And }) => {
        let confirmationToken: string;

        Given(
          "I registered information including criminal record and diploma",
          async () => {
            const registerPayload = RegisterHelperRequestFixture.aValidRequest({
              email: context.testEmail,
            });

            await context.server.inject({
              method: "POST",
              url: "/api/helpers/register",
              payload: registerPayload,
            });

            confirmationToken =
              await context.supabaseHelper.generateEmailConfirmationToken(
                context.testEmail
              );
          }
        );

        And("I have never confirm my email before", async () => {
          const user = await context.supabaseHelper.getUserByEmail(
            context.testEmail
          );
          expect(user?.email_confirmed_at).toBeFalsy();
        });

        When("I confirm my email", async () => {
          context.response = await context.server.inject({
            method: "POST",
            url: "/api/helpers/confirm-email",
            payload: {
              email: context.testEmail,
              token: confirmationToken,
            },
          });
        });

        Then("I have been granted limited access", async () => {
          expect(context.response?.statusCode).toBe(200);

          const body = context.response?.json();
          expect(body).toHaveProperty("message");
          expect(body.message).toContain("confirmed successfully");

          const user = await context.supabaseHelper.getUserByEmail(
            context.testEmail
          );
          expect(user?.email_confirmed_at).toBeTruthy();
        });

        And("I cannot apply to events", () => {});

        And("I should be pending review", async () => {
          const helper = await context.supabaseHelper.waitForHelper(
            context.testEmail
          );
          expect(helper).toBeDefined();
          expect(helper.status).toBe("pending_review");
        });
      }
    );
  },
  { includeTags: ["integration"] }
);
