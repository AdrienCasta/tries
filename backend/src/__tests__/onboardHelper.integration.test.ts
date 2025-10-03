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
  let helperRepository: SupabaseHelperRepository;
  let helperAccountRepository: SupabaseHelperAccountRepository;
  let notificationService: FakeOnboardedHelperNotificationService;
  let clock: SystemClock;
  let createdHelperId: string | null = null;
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

    helperRepository = new SupabaseHelperRepository(supabase);
    helperAccountRepository = new SupabaseHelperAccountRepository(supabase);

    useCase = new OnboardHelper(
      helperRepository,
      helperAccountRepository,
      notificationService,
      clock
    );
  });

  afterEach(async () => {
    if (createdHelperId) {
      await supabase.auth.admin.deleteUser(createdHelperId);
      await supabase.from("helpers").delete().eq("id", createdHelperId);
      createdHelperId = null;
    }
  });

  it("should successfully onboard a helper and store in Supabase", async () => {
    const user: User = {
      email: testEmail,
      firstname: "John",
      lastname: "Doe",
    };

    const result = await useCase.execute(user);

    expect(result.success).toBe(true);

    if (result.success) {
      createdHelperId = result.value.value;
    }

    // Use repository methods instead of raw queries
    const helper = await helperRepository.findByEmail(testEmail);

    expect(helper).toBeDefined();
    expect(helper?.email.value).toBe(testEmail);
    expect(helper?.firstname.value).toBe("John");
    expect(helper?.lastname.value).toBe("Doe");

    const helperAccount = await helperAccountRepository.findByEmail(testEmail);

    expect(helperAccount).toBeDefined();
    expect(helperAccount?.email.value).toBe(testEmail);
    expect(helperAccount?.passwordSetupToken).toBeDefined();
    expect(helperAccount?.passwordSetupToken?.expiration).toBeDefined();
  });
});
