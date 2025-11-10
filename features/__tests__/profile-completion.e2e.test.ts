import { expect } from "vitest";
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { chromium, Browser, Page } from "playwright";
import { ChildProcess, spawn } from "child_process";
import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(__dirname, "../../backend/.env.test") });

import featureContent from "../profile-completion.feature?raw";

const feature = await loadFeatureFromText(featureContent);

interface E2ETestContext {
  browser: Browser;
  page: Page;
  backendProcess: ChildProcess;
  frontendProcess: ChildProcess;
  supabaseClient: SupabaseClient;
  testEmail: string;
}

const BACKEND_URL = "http://localhost:3000";
const FRONTEND_URL = "http://localhost:5173";
const BACKEND_START_TIMEOUT = 30000;
const FRONTEND_START_TIMEOUT = 30000;

async function waitForServer(url: string, timeout: number): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        return;
      }
    } catch (error) {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}

function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `test-profile-${timestamp}-${random}@example.com`;
}

async function getOtpCodeFromSupabase(
  supabaseClient: SupabaseClient,
  email: string
): Promise<string> {
  const response = await fetch(
    `${BACKEND_URL}/test/otp/${encodeURIComponent(email)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to get OTP: ${response.statusText}`);
  }

  const data = await response.json();
  return data.otpCode;
}

describeFeature(
  feature,
  ({
    BeforeEachScenario,
    AfterEachScenario,
    Background,
    Scenario,
    Given,
    When,
    Then,
    And,
  }) => {
    const context: E2ETestContext = {} as E2ETestContext;

    Background(({ Given }) => {
      Given("I am a new user", async () => {
        context.testEmail = generateRandomEmail();
        expect(context.testEmail).toBeDefined();
      });
    });

    BeforeEachScenario(async () => {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error(
          "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.test"
        );
      }

      context.supabaseClient = createClient(
        supabaseUrl,
        supabaseServiceRoleKey
      );

      context.backendProcess = spawn("npm", ["run", "start"], {
        cwd: path.join(__dirname, "../../backend"),
        env: {
          ...process.env,
          NODE_ENV: "test",
          PORT: "3000",
        },
        stdio: "pipe",
      });

      await waitForServer(BACKEND_URL, BACKEND_START_TIMEOUT);

      context.frontendProcess = spawn("npm", ["run", "dev"], {
        cwd: path.join(__dirname, "../../frontend"),
        env: {
          ...process.env,
          PORT: "5173",
        },
        stdio: "pipe",
      });

      await waitForServer(FRONTEND_URL, FRONTEND_START_TIMEOUT);

      context.browser = await chromium.launch({ headless: false });
      context.page = await context.browser.newPage();
    });

    AfterEachScenario(async () => {
      if (context.page) {
        await context.page.close();
      }
      if (context.browser) {
        await context.browser.close();
      }

      if (context.testEmail && context.supabaseClient) {
        const { data } = await context.supabaseClient.auth.admin.listUsers();
        const user = data?.users?.find((u) => u.email === context.testEmail);
        if (user) {
          await context.supabaseClient.auth.admin.deleteUser(user.id);
        }
      }

      if (context.backendProcess) {
        context.backendProcess.kill("SIGTERM");
      }
      if (context.frontendProcess) {
        context.frontendProcess.kill("SIGTERM");
      }
    });

    Scenario(
      "First-time user sees profile completion popup after email verification",
      ({ Given, When, Then, And }) => {
        When("I sign up with my email", async () => {
          await context.page.goto(FRONTEND_URL + "/auth");
          await context.page.fill('input[type="email"]', context.testEmail);
          await context.page
            .getByRole("button", { name: /continuer/i })
            .click();
        });

        And("I verify my email with the OTP code", async () => {
          await context.page.waitForURL(/\/verify-email\?email=/, {
            timeout: 15000,
          });

          const otpCode = await getOtpCodeFromSupabase(
            context.supabaseClient,
            context.testEmail
          );

          const otpInput = context.page.locator('[data-slot="input-otp"]');
          await otpInput.click();
          await otpInput.pressSequentially(otpCode, { delay: 100 });
        });

        Then("I should be redirected to the dashboard", async () => {
          await context.page.waitForURL(/\/dashboard/, { timeout: 15000 });
          expect(context.page.url()).toContain("/dashboard");
        });

        And("I should see a profile completion dialog", async () => {
          const dialog = await context.page.waitForSelector('[role="dialog"]', {
            timeout: 5000,
          });
          expect(dialog).toBeTruthy();

          const dialogContent = await dialog.textContent();
          expect(dialogContent).toContain("profil");
        });

        And(
          "the dialog should have firstname and lastname fields",
          async () => {
            const firstnameInput = await context.page.locator(
              'input#firstname, input[name="firstname"]'
            );
            const lastnameInput = await context.page.locator(
              'input#lastname, input[name="lastname"]'
            );

            expect(await firstnameInput.count()).toBeGreaterThan(0);
            expect(await lastnameInput.count()).toBeGreaterThan(0);
          }
        );

        And('the dialog should have a "Skip for now" button', async () => {
          const skipButton = await context.page.locator(
            'button:has-text("Passer"), button:has-text("Skip")'
          );
          expect(await skipButton.count()).toBeGreaterThan(0);
        });

        And('the dialog should have a "Complete Profile" button', async () => {
          const completeButton = await context.page.locator(
            'button:has-text("Compléter"), button:has-text("Complete")'
          );
          expect(await completeButton.count()).toBeGreaterThan(0);
        });
      }
    );

    Scenario(
      "User can skip profile completion",
      ({ Given, When, Then, And }) => {
        Given("I have verified my email", async () => {
          await context.page.goto(FRONTEND_URL + "/auth");
          await context.page.fill('input[type="email"]', context.testEmail);
          await context.page
            .getByRole("button", { name: /continuer/i })
            .click();

          await context.page.waitForURL(/\/verify-email\?email=/, {
            timeout: 15000,
          });

          const otpCode = await getOtpCodeFromSupabase(
            context.supabaseClient,
            context.testEmail
          );

          const otpInput = context.page.locator('[data-slot="input-otp"]');
          await otpInput.click();
          await otpInput.pressSequentially(otpCode, { delay: 100 });

          await context.page.waitForURL(/\/dashboard/, { timeout: 15000 });
        });

        And("I am on the dashboard", async () => {
          expect(context.page.url()).toContain("/dashboard");
        });

        And("the profile completion dialog is displayed", async () => {
          const dialog = await context.page.waitForSelector('[role="dialog"]', {
            timeout: 5000,
          });
          expect(dialog).toBeTruthy();
        });

        When('I click "Skip for now"', async () => {
          const skipButton = await context.page
            .locator('button:has-text("Passer"), button:has-text("Skip")')
            .first();
          await skipButton.click();
        });

        Then("the dialog should close", async () => {
          await context.page.waitForSelector('[role="dialog"]', {
            state: "hidden",
            timeout: 5000,
          });
          const dialog = await context.page.locator('[role="dialog"]');
          expect(await dialog.count()).toBe(0);
        });

        And("I should still be on the dashboard", async () => {
          expect(context.page.url()).toContain("/dashboard");
        });
      }
    );

    Scenario("User completes their profile", ({ Given, When, Then, And }) => {
      Given("I have verified my email", async () => {
        await context.page.goto(FRONTEND_URL + "/auth");
        await context.page.fill('input[type="email"]', context.testEmail);
        await context.page.getByRole("button", { name: /continuer/i }).click();

        await context.page.waitForURL(/\/verify-email\?email=/, {
          timeout: 15000,
        });

        const otpCode = await getOtpCodeFromSupabase(
          context.supabaseClient,
          context.testEmail
        );

        const otpInput = context.page.locator('[data-slot="input-otp"]');
        await otpInput.click();
        await otpInput.pressSequentially(otpCode, { delay: 100 });

        await context.page.waitForURL(/\/dashboard/, { timeout: 15000 });
      });

      And("I am on the dashboard", async () => {
        expect(context.page.url()).toContain("/dashboard");
      });

      And("the profile completion dialog is displayed", async () => {
        const dialog = await context.page.waitForSelector('[role="dialog"]', {
          timeout: 5000,
        });
        expect(dialog).toBeTruthy();
      });

      When('I enter "Jean" as firstname', async () => {
        const firstnameInput = await context.page
          .locator('input#firstname, input[name="firstname"]')
          .first();
        await firstnameInput.fill("Jean");
      });

      And('I enter "Dupont" as lastname', async () => {
        const lastnameInput = await context.page
          .locator('input#lastname, input[name="lastname"]')
          .first();
        await lastnameInput.fill("Dupont");
      });

      And('I click "Complete Profile"', async () => {
        const completeButton = await context.page
          .locator('button:has-text("Compléter"), button:has-text("Complete")')
          .first();
        await completeButton.click();
      });

      Then("the dialog should close", async () => {
        await context.page.waitForSelector('[role="dialog"]', {
          state: "hidden",
          timeout: 5000,
        });
        const dialog = await context.page.locator('[role="dialog"]');
        expect(await dialog.count()).toBe(0);
      });

      And("my profile should be updated", async () => {
        await context.page.reload();
        await context.page.waitForLoadState("networkidle");

        const dialog = await context.page.locator('[role="dialog"]');
        expect(await dialog.count()).toBe(0);
      });

      And("the dialog should not appear on subsequent visits", async () => {
        await context.page.goto(FRONTEND_URL + "/dashboard");
        await context.page.waitForTimeout(2000);

        const dialog = await context.page.locator('[role="dialog"]');
        expect(await dialog.count()).toBe(0);
      });
    });

    Scenario.skip(
      "Returning user with completed profile doesn't see popup",
      ({ Given, When, Then, And }) => {
        Given("I have previously completed my profile", async () => {
          await context.page.goto(FRONTEND_URL + "/auth");
          await context.page.fill('input[type="email"]', context.testEmail);
          await context.page
            .getByRole("button", { name: /continuer/i })
            .click();

          await context.page.waitForURL(/\/verify-email\?email=/, {
            timeout: 15000,
          });

          const otpCode = await getOtpCodeFromSupabase(
            context.supabaseClient,
            context.testEmail
          );

          const otpInput = context.page.locator('[data-slot="input-otp"]');
          await otpInput.click();
          await otpInput.pressSequentially(otpCode, { delay: 100 });

          await context.page.waitForURL(/\/dashboard/, { timeout: 15000 });

          const dialog = await context.page.waitForSelector('[role="dialog"]', {
            timeout: 5000,
          });
          expect(dialog).toBeTruthy();

          const firstnameInput = await context.page
            .locator('input#firstname, input[name="firstname"]')
            .first();
          await firstnameInput.fill("Jean");

          const lastnameInput = await context.page
            .locator('input#lastname, input[name="lastname"]')
            .first();
          await lastnameInput.fill("Dupont");

          const completeButton = await context.page
            .locator(
              'button:has-text("Compléter"), button:has-text("Complete")'
            )
            .first();
          await completeButton.click();

          await context.page.waitForSelector('[role="dialog"]', {
            state: "hidden",
            timeout: 5000,
          });
        });

        When("I sign in with my email", async () => {
          await context.page.goto(FRONTEND_URL + "/auth");
          await context.page.fill('input[type="email"]', context.testEmail);
          await context.page
            .getByRole("button", { name: /continuer/i })
            .click();
        });

        And("I verify my email with the OTP code", async () => {
          await context.page.waitForURL(/\/verify-email\?email=/, {
            timeout: 15000,
          });

          const otpCode = await getOtpCodeFromSupabase(
            context.supabaseClient,
            context.testEmail
          );

          const otpInput = context.page.locator('[data-slot="input-otp"]');
          await otpInput.click();
          await otpInput.pressSequentially(otpCode, { delay: 100 });
        });

        Then("I should be redirected to the dashboard", async () => {
          await context.page.waitForURL(/\/dashboard/, { timeout: 15000 });
          expect(context.page.url()).toContain("/dashboard");
        });

        And("I should not see a profile completion dialog", async () => {
          await context.page.waitForTimeout(2000);

          const dialog = await context.page.locator('[role="dialog"]');
          expect(await dialog.count()).toBe(0);
        });
      }
    );
  }
);
