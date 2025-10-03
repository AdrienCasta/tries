import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { config } from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { OnboardHelper } from "../application/use-cases/OnboardHelper.js";
import { SystemClock } from "../infrastructure/services/SystemClock.js";
import { FakeOnboardedHelperNotificationService } from "../infrastructure/services/InMemoryOnboardingHelperNotificationService.js";
import { SupabaseHelperRepository } from "../infrastructure/repositories/SupabaseHelperRepository.js";
import { SupabaseHelperAccountRepository } from "../infrastructure/repositories/SupabaseHelperAccountRepository.js";
import { User } from "../domain/entities/User.js";

config({ path: ".env.test" });

describe("Integration: OnboardHelper with Supabase", () => {
  let supabase: SupabaseClient;
  let useCase: OnboardHelper;
  let notificationService: FakeOnboardedHelperNotificationService;
  let clock: SystemClock;
  const testEmail = `test-${Date.now()}@example.com`;

  beforeAll(() => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials in .env.test");
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    clock = new SystemClock();
    notificationService = new FakeOnboardedHelperNotificationService({
      companyName: "Tries",
      supportEmailContact: "tries@support.fr",
      passwordSetupUrl: "https://tries.fr/setup-password",
    });

    const helperRepository = new SupabaseHelperRepository(supabase);
    const helperAccountRepository = new SupabaseHelperAccountRepository(
      supabase
    );

    useCase = new OnboardHelper(
      helperRepository,
      helperAccountRepository,
      notificationService,
      clock
    );
  });

  afterEach(async () => {
    const { data } = await supabase.auth.admin.listUsers();
    const user = data?.users.find((u) => u.email === testEmail);
    if (user) {
      await supabase.auth.admin.deleteUser(user.id);
    }
    await supabase.from("helpers").delete().eq("email", testEmail);
  });

  it("should successfully onboard a helper and store in Supabase", async () => {
    const user: User = {
      email: testEmail,
      firstname: "John",
      lastname: "Doe",
    };

    const result = await useCase.execute(user);

    expect(result.success).toBe(true);

    const { data: helper } = await supabase
      .from("helpers")
      .select("*")
      .eq("email", testEmail)
      .single();

    expect(helper).toBeDefined();
    expect(helper.email).toBe(testEmail);
    expect(helper.firstname).toBe("John");
    expect(helper.lastname).toBe("Doe");

    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUser = authData?.users.find((u) => u.email === testEmail);

    expect(authUser).toBeDefined();
    expect(authUser?.email).toBe(testEmail);
    expect(authUser?.user_metadata?.password_setup_token).toBeDefined();
    expect(
      authUser?.user_metadata?.password_setup_token_expires_at
    ).toBeDefined();
  });
});
