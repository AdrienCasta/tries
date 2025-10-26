import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export class SupabaseTestHelper {
  private client: SupabaseClient;
  private createdUserIds: string[] = [];

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

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    if (!user) {
      return;
    }

    await this.client.from("helpers").delete().eq("id", user.id);

    await this.client.auth.admin.deleteUser(user.id);
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.client.auth.admin.listUsers();
    if (error || !data) {
      throw new Error(`Failed to list users: ${error?.message}`);
    }
    return data.users.find((u) => u.email === email) || null;
  }

  async waitForUser(
    email: string,
    maxRetries: number = 5,
    delayMs: number = 100
  ) {
    for (let i = 0; i < maxRetries; i++) {
      const user = await this.getUserByEmail(email);
      if (user) {
        return user;
      }
      if (i < maxRetries - 1) {
        await this.sleep(delayMs * Math.pow(2, i));
      }
    }
    throw new Error(
      `User with email ${email} not found after ${maxRetries} retries`
    );
  }

  async getHelperByEmail(email: string) {
    const { data: authData, error: authError } =
      await this.client.auth.admin.listUsers();

    if (authError || !authData) {
      throw new Error(`Failed to list users: ${authError?.message}`);
    }

    const authUser = authData.users.find((u) => u.email === email);
    if (!authUser) {
      return null;
    }

    const { data, error } = await this.client
      .from("helpers")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch helper: ${error.message}`);
    }

    return data;
  }

  async waitForHelper(
    email: string,
    maxRetries: number = 5,
    delayMs: number = 100
  ) {
    for (let i = 0; i < maxRetries; i++) {
      const helper = await this.getHelperByEmail(email);
      if (helper) {
        return helper;
      }
      if (i < maxRetries - 1) {
        await this.sleep(delayMs * Math.pow(2, i));
      }
    }
    throw new Error(
      `Helper with email ${email} not found after ${maxRetries} retries`
    );
  }

  async generateEmailConfirmationToken(email: string): Promise<string> {
    await this.waitForUser(email);

    const { data, error } = await this.client.auth.admin.generateLink({
      type: "signup",
      email,
      password: "",
    });

    if (error || !data) {
      throw new Error(
        `Failed to generate confirmation link: ${error?.message}`
      );
    }

    const url = new URL(data.properties.action_link);
    const token =
      url.searchParams.get("token_hash") || url.searchParams.get("token");

    if (!token) {
      throw new Error("No token found in confirmation link");
    }

    return token;
  }
}
