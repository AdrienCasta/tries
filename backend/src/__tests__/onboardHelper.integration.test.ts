import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { config } from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { OnboardHelper } from "../application/use-cases/OnboardHelper.js";
import { SystemClock } from "../infrastructure/services/SystemClock.js";
import { FakeOnboardedHelperNotificationService } from "../infrastructure/services/InMemoryOnboardingHelperNotificationService.js";
import { SupabaseHelperRepository } from "../infrastructure/repositories/SupabaseHelperRepository.js";
import { SupabaseHelperAccountRepository } from "../infrastructure/repositories/SupabaseHelperAccountRepository.js";
import { User } from "../domain/entities/User.js";
import HelperId from "../domain/value-objects/HelperId.js";
import { SupabaseOnboardedHelperNotificationService } from "../infrastructure/services/SupabaseOnboardedHelperNotificationService.js";
import { OnboardedHelperNotificationService } from "../domain/services/OnboardingHelperNotificationService.js";

config({ path: ".env.test" });

describe("Integration: OnboardHelper with Supabase", () => {
  let supabase: SupabaseClient;
  let onboardHelper: OnboardHelper;
  let helperRepository: SupabaseHelperRepository;
  let helperAccountRepository: SupabaseHelperAccountRepository;
  let notificationService: OnboardedHelperNotificationService;
  let clock: SystemClock;
  let createdHelperId: HelperId | null = null;
  const testEmail = `adrien.castagliola+3@gmail.com`;

  beforeAll(() => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials in .env.test");
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    clock = new SystemClock();
    notificationService = new SupabaseOnboardedHelperNotificationService(
      supabase
    );
    notificationService.send = vi.fn();

    helperRepository = new SupabaseHelperRepository(supabase);
    helperAccountRepository = new SupabaseHelperAccountRepository(supabase);

    onboardHelper = new OnboardHelper(
      helperRepository,
      helperAccountRepository,
      notificationService,
      clock
    );
  });

  afterEach(async () => {
    if (createdHelperId) {
      const {
        data: { users },
        error: fetchError,
      } = await supabase.auth.admin.listUsers();

      for (const user of users) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      await supabase.from("helpers").delete().eq("id", createdHelperId.value);
      createdHelperId = null;
    }
  });

  it("successfully onboards a helper", async () => {
    const user: User = {
      email: testEmail,
      firstname: "John",
      lastname: "Doe",
    };

    const result = await onboardHelper.execute(user);

    expect(result.success).toBe(true);

    if (result.success) {
      createdHelperId = result.value;
    }

    const helperAccount = await helperAccountRepository.findByHelperId(
      createdHelperId as HelperId
    );

    expect(helperAccount).toBeDefined();
  });

  it("helper is invited to confirm its e-mail", async () => {
    expect(notificationService.send).toHaveBeenCalledOnce();
  });
});
