import { expect } from "vitest";
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { chromium, Browser, Page } from "playwright";
import { ChildProcess, spawn } from "child_process";
import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(__dirname, "../../backend/.env.test") });

import featureContent from "../email-verification-journey.feature?raw";

const feature = await loadFeatureFromText(featureContent);

interface E2ETestContext {
  browser: Browser;
  page: Page;
  backendProcess: ChildProcess;
  frontendProcess: ChildProcess;
  supabaseClient: SupabaseClient;
  testEmail: string;
  testPassword: string;
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
  return `test-otp-${timestamp}-${random}@example.com`;
}

async function getOtpCodeFromSupabase(
  supabaseClient: SupabaseClient,
  email: string
): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/test/otp/${encodeURIComponent(email)}`);

  if (!response.ok) {
    throw new Error(`Failed to get OTP: ${response.statusText}`);
  }

  const data = await response.json();
  return data.otpCode;
}

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, Scenario, Given, When, Then, And }) => {
    const context: E2ETestContext = {} as E2ETestContext;

    BeforeEachScenario(async () => {
      context.testEmail = generateRandomEmail();
      context.testPassword = "SecurePass123!";

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

    Scenario("User completes signup and email verification successfully", ({ Given, When, Then, And }) => {
      Given("I am on the signup page", async () => {
        await context.page.goto(FRONTEND_URL + "/signup");
        await context.page.getByLabel(/email/i).waitFor({ timeout: 10000 });
      });

      When("I submit my signup information", async () => {
        await context.page.getByLabel(/email/i).fill(context.testEmail);
        await context.page
          .getByLabel(/^password$/i)
          .fill(context.testPassword);
        await context.page
          .getByLabel(/confirm password/i)
          .fill(context.testPassword);

        await context.page
          .getByRole("button", { name: /sign up|signup/i })
          .click();
      });

      Then("I should be redirected to the email verification page", async () => {
        await context.page.waitForURL(/\/verify-email\?email=/, { timeout: 15000 });
        const url = context.page.url();
        expect(url).toContain("/verify-email");
        expect(url).toContain(encodeURIComponent(context.testEmail));
      });

      And("I should see my email address displayed", async () => {
        const emailDisplay = await context.page.waitForSelector(
          `text=${context.testEmail}`,
          { timeout: 5000 }
        );
        expect(emailDisplay).toBeTruthy();
      });

      When("I enter the correct OTP code", async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const otpCode = await getOtpCodeFromSupabase(
          context.supabaseClient,
          context.testEmail
        );

        const otpInputs = await context.page.locator('input[type="text"]').all();

        for (let i = 0; i < otpCode.length && i < otpInputs.length; i++) {
          await otpInputs[i].fill(otpCode[i]);
        }
      });

      Then("I should be redirected to the dashboard", async () => {
        await context.page.waitForURL(/\/dashboard/, { timeout: 15000 });
        const url = context.page.url();
        expect(url).toContain("/dashboard");
      });

      And("my email should be verified in the system", async () => {
        const { data } = await context.supabaseClient.auth.admin.listUsers();
        const user = data?.users?.find((u) => u.email === context.testEmail);
        expect(user).toBeDefined();
        expect(user?.email_confirmed_at).toBeTruthy();
      });
    });

    Scenario("User can resend OTP code", ({ Given, When, Then, And }) => {
      Given("I am on the email verification page after signup", async () => {
        await context.page.goto(FRONTEND_URL + "/signup");
        await context.page.getByLabel(/email/i).waitFor({ timeout: 10000 });

        await context.page.getByLabel(/email/i).fill(context.testEmail);
        await context.page
          .getByLabel(/^password$/i)
          .fill(context.testPassword);
        await context.page
          .getByLabel(/confirm password/i)
          .fill(context.testPassword);

        await context.page
          .getByRole("button", { name: /sign up|signup/i })
          .click();

        await context.page.waitForURL(/\/verify-email\?email=/, { timeout: 15000 });
      });

      When("I click the resend OTP button", async () => {
        const resendButton = await context.page.waitForSelector(
          "button:has-text('Resend Code')",
          { timeout: 5000 }
        );
        await resendButton.click();
      });

      Then("I should see a confirmation that the code was resent", async () => {
        const successMessage = await context.page.waitForSelector(
          "text=/sent|resent/i",
          { timeout: 10000, state: "visible" }
        );
        expect(successMessage).toBeTruthy();
      });

      And("I should wait 60 seconds before I can resend again", async () => {
        const resendButton = context.page.locator("button:has-text('Resend in')");
        await resendButton.waitFor({ timeout: 5000 });

        const buttonText = await resendButton.textContent();
        expect(buttonText).toMatch(/Resend in \d+s/);
      });

      When("I enter the new OTP code", async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const otpCode = await getOtpCodeFromSupabase(
          context.supabaseClient,
          context.testEmail
        );

        const otpInputs = await context.page.locator('input[type="text"]').all();

        for (let i = 0; i < otpCode.length && i < otpInputs.length; i++) {
          await otpInputs[i].fill(otpCode[i]);
        }
      });

      Then("I should be redirected to the dashboard", async () => {
        await context.page.waitForURL(/\/dashboard/, { timeout: 15000 });
        const url = context.page.url();
        expect(url).toContain("/dashboard");
      });
    });
  },
  { includeTags: ["integration"] }
);
