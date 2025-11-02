import { expect } from "vitest";
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { chromium, Browser, Page } from "playwright";
import { ChildProcess, spawn } from "child_process";
import path from "path";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(__dirname, "../../backend/.env.test") });

//@ts-ignore
import featureContent from "../signup.feature?raw";

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
      Given("I am a new user wishing to sign up", () => {});
    });

    Scenario("User signs up successfully", ({ When, Then, And }) => {
      When("I submit my signup information", async () => {
        await context.page.goto(FRONTEND_URL + "/signup");

        await context.page.fill('input[type="email"]', context.testEmail);
        await context.page.fill("input#firstname", "Test");
        await context.page.fill("input#lastname", "User");

        await context.page
          .getByRole("button", { name: /s'inscrire|inscrire/i })
          .click();
      });

      Then("I am notified signup was successful", async () => {
        await context.page.waitForURL(/\/verify-email/);
        expect(context.page.url()).toContain("/verify-email?email=");
      });

      And("notified I have enter otp code to confirm my email", async () => {
        expect(context.page.url()).toContain("/verify-email");
        expect(context.page.url()).toContain(
          `email=${encodeURIComponent(context.testEmail)}`
        );
      });
    });
  },
  { includeTags: ["integration"] }
);
