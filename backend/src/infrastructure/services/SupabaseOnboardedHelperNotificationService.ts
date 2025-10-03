import { SupabaseClient } from "@supabase/supabase-js";
import { OnboardedHelperNotificationService } from "../../domain/services/OnboardingHelperNotificationService.js";

export class SupabaseOnboardedHelperNotificationService
  implements OnboardedHelperNotificationService
{
  constructor(private readonly supabase: SupabaseClient) {}

  async send({ email }) {
    const { data, error } = await this.supabase.auth.admin.inviteUserByEmail(
      email
    );
  }

  async hasSentTo(email: string): Promise<boolean> {
    return true;
  }
}
