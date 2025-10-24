import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export class SupabaseTestHelper {
  private client: SupabaseClient;
  private createdUserIds: string[] = ["cfb5fd58-d2dc-496f-b6c4-38dac74e399c"];

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.test"
      );
    }

    this.client = createClient(supabaseUrl, supabaseServiceRoleKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async cleanup(): Promise<void> {
    for (const userId of this.createdUserIds) {
      await this.client.auth.admin.deleteUser(userId);
    }
    this.createdUserIds = [];
  }

  trackUserForCleanup(userId: string): void {
    this.createdUserIds.push(userId);
  }

  async deleteUserByEmail(email: string): Promise<void> {
    const { data } = await this.client.auth.admin.listUsers();
    const user = data?.users?.find((u) => u.email === email);
    if (user) {
      await this.client.auth.admin.deleteUser(user.id);
    }
  }

  async getUserByEmail(email: string) {
    const { data } = await this.client.auth.admin.listUsers();
    return data?.users?.find((u) => u.email === email);
  }
}
