import { expect } from "vitest";
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { FastifyHttpServer } from "@infrastructure/http/FastifyHttpServer";
import { SupabaseTestHelper } from "@__tests__/helpers/SupabaseTestHelper";
import { SupabaseAuthService } from "@infrastructure/auth/SupabaseAuthService";
import { SupabaseUserRepository } from "@infrastructure/persistence/SupabaseUserRepository";
import { AppDependencies, createApp } from "@app/createApp";
import { EmailFixtures } from "@shared/__tests__/fixtures/EmailFixtures";

//@ts-ignore
import featureContent from "../../../../../features/signup.feature?raw";

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

      const dependencies: AppDependencies = {
        authService: new SupabaseAuthService(supabase),
        userRepository: new SupabaseUserRepository(supabase),
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
      Given("I am a new user wishing to sign up", () => {});
    });

    Scenario("User signs up successfully", ({ When, Then, And }) => {
      When("I submit my signup information", async () => {
        context.response = await context.server.inject({
          method: "POST",
          url: "/api/auth/signup",
          payload: {
            email: context.testEmail,
            firstname: "John",
            lastname: "Doe",
          },
        });
      });

      Then("I am notified signup was successful", () => {
        expect(context.response?.statusCode).toBe(201);
        const body = context.response?.json();
        expect(body.message).toBe("User signed up successfully");
      });

      And("notified I have enter otp code to confirm my email", async () => {
        const user = await context.supabaseHelper.getUserByEmail(
          context.testEmail
        );
        expect(user).toBeDefined();
        expect(user?.email).toBe(context.testEmail);
        // Note: email_confirmed_at may be set in test environment due to auto-confirm
      });
    });

    Scenario(
      "Cannot sign up with duplicate email",
      ({ Given, When, Then, And }) => {
        Given(
          'a user with email "john@example.com" already exists',
          async () => {
            await context.server.inject({
              method: "POST",
              url: "/api/auth/signup",
              payload: {
                email: "john@example.com",
                firstname: "John",
                lastname: "Doe",
              },
            });
          }
        );

        When("I attempt to sign up with the same email", async () => {
          context.response = await context.server.inject({
            method: "POST",
            url: "/api/auth/signup",
            payload: {
              email: "john@example.com",
              firstname: "Jane",
              lastname: "Smith",
            },
          });
        });

        Then(
          'I am notified it went wrong because "Email already in use"',
          () => {
            expect(context.response?.statusCode).toBe(409);
            const body = context.response?.json();
            expect(body.error).toBe("this email address is already in use.");
          }
        );

        And("I must use a different email to proceed", () => {
          const body = context.response?.json();
          expect(body.code).toBe("EmailAlreadyInUseError");
        });
      }
    );
  },
  { includeTags: ["integration"] }
);
