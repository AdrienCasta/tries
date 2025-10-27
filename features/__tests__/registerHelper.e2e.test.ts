import { expect } from "vitest";
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { chromium, Browser, Page } from "playwright";
import { ChildProcess, spawn } from "child_process";
import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(__dirname, "../../backend/.env.test") });

import featureContent from "../registerHelper.feature?raw";

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
  return `test-${timestamp}-${random}@example.com`;
}

describeFeature(
  feature,
  ({ BeforeEachScenario, AfterEachScenario, Scenario, Background }) => {
    const context: E2ETestContext = {} as E2ETestContext;

    BeforeEachScenario(async () => {
      context.testEmail = generateRandomEmail();

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
          await context.supabaseClient
            .from("helpers")
            .delete()
            .eq("id", user.id);
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

    Background(({ Given }) => {
      Given(
        "I am healthcare professional wishing to become an helper",
        () => {}
      );
    });

    Scenario("Helper register successfully", ({ When, Then, And }) => {
      When("I submit my information", async () => {
        await context.page.goto(FRONTEND_URL);
        await context.page.getByLabel(/email/i).waitFor({ timeout: 10000 });

        await context.page.getByLabel(/email/i).fill(context.testEmail);
        await context.page.getByLabel(/password/i).fill("12345AZERTpoiu!!!");
        await context.page.getByLabel(/first name/i).fill("John");
        await context.page.getByLabel(/last name/i).fill("Doe");
        await context.page.getByLabel(/phone number/i).fill("+33612345678");

        await context.page.getByTestId("profession-selector-add").click();
        await context.page
          .getByRole("option", { name: /physiotherapist/i })
          .click();

        await context.page
          .getByLabel(/rpps.*physiotherapist/i)
          .fill("12345678901");

        await context.page.getByLabel(/birthdate/i).fill("1990-01-01");

        await context.page.getByTestId("place-of-birth-country-select").click();
        await context.page
          .getByRole("option", { name: /france/i })
          .first()
          .click();

        await context.page.getByLabel(/city.*birth/i).fill("Paris");

        await context.page.getByTestId("residence-country-select").click();
        await context.page.getByRole("option", { name: /france/i }).click();

        await context.page.getByTestId("residence-area-code-select").click();
        await context.page.getByRole("option", { name: "44" }).click();

        await context.page
          .getByLabel(/professional description/i)
          .fill(
            "I am an experienced physiotherapist with over 10 years of practice in sports medicine and rehabilitation."
          );

        await context.page
          .getByRole("button", { name: /onboard helper/i })
          .click();
      });

      Then("I am notified it went well", async () => {
        const successMessage = await context.page.waitForSelector(
          "text=/successfully|success|registered/i",
          { timeout: 5000 }
        );
        expect(successMessage).toBeTruthy();
      });

      And("notified I have to confirm my email", async () => {
        const emailConfirmationMessage = await context.page.waitForSelector(
          "text=/confirm.*email|email.*confirm/i",
          { timeout: 5000 }
        );
        expect(emailConfirmationMessage).toBeTruthy();

        const { data } = await context.supabaseClient.auth.admin.listUsers();
        const user = data?.users?.find((u) => u.email === context.testEmail);
        expect(user).toBeDefined();
        expect(user?.email).toBe(context.testEmail);
        expect(user?.email_confirmed_at).toBeFalsy();
      });
    });
  },
  { includeTags: ["integration"] }
);
