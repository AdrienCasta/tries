import { expect, vi } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";
import { createApp } from "../../../app/createApp.js";
import { FastifyHttpServer } from "@infrastructure/http/FastifyHttpServer.js";
import { SupabaseHelperRepository } from "@infrastructure/persistence/SupabaseHelperRepository.js";
import { SupabaseHelperAccountRepository } from "@infrastructure/persistence/SupabaseHelperAccountRepository.js";
import { SupabaseOnboardedHelperNotificationService } from "@infrastructure/notifications/SupabaseOnboardedHelperNotificationService.js";
import { FixedClock } from "@infrastructure/time/FixedClock.js";
import InMemoryEventBus from "@infrastructure/events/InMemoryEventBus.js";
import { OnboardHelperCommand } from "../OnboardHelper.command.js";

/**
 * E2E Test Helper for Onboard Helper Feature
 *
 * Manages real infrastructure setup (Supabase, Fastify) and provides
 * domain-focused assertion methods. Hides technical details of database
 * queries, auth operations, and HTTP implementation.
 */
export default class OnboardHelperE2ETest {
  private server!: HttpServer;
  private supabase!: SupabaseClient;
  private notificationService!: SupabaseOnboardedHelperNotificationService;
  private testEmails: string[] = [];
  private lastResponse: any;

  async setup(): Promise<void> {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const helperRepository = new SupabaseHelperRepository(this.supabase);
    const helperAccountRepository = new SupabaseHelperAccountRepository(
      this.supabase
    );
    this.notificationService = new SupabaseOnboardedHelperNotificationService(
      this.supabase
    );
    // Mock email sending in E2E - we test HTTP + DB, not actual email delivery
    this.notificationService.send = vi.fn();
    const clock = new FixedClock(new Date("2025-01-15T10:00:00Z"));

    const fastifyServer = new FastifyHttpServer();
    this.server = createApp(fastifyServer, {
      helperRepository,
      helperAccountRepository,
      notificationService: this.notificationService,
      clock,
      eventBus: new InMemoryEventBus(),
    });

    await this.server.ready();
  }

  async teardown(): Promise<void> {
    await this.server.close();
    for (const email of this.testEmails) {
      await this.cleanupEmail(email);
    }
    this.testEmails = [];
  }

  registerEmailForCleanup(email: string): void {
    this.testEmails.push(email);
  }

  async cleanupEmail(email: string): Promise<void> {
    try {
      const { data } = await this.supabase.auth.admin.listUsers();
      const user = data.users.find((u) => u.email === email);
      if (user) {
        await this.supabase.auth.admin.deleteUser(user.id);
      }
    } catch (error) {
      console.error(`Cleanup Auth failed for ${email}:`, error);
    }

    try {
      await this.supabase.from("helpers").delete().eq("email", email);
    } catch (error) {
      console.error(`Cleanup helpers table failed for ${email}:`, error);
    }
  }

  async onboardUser(user: OnboardHelperCommand): Promise<void> {
    this.lastResponse = await this.server.inject({
      method: "POST",
      url: "/api/helpers/onboard",
      payload: {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phoneNumber,
        profession: user.professions,
      },
    });
  }

  async assertHelperOnboarded(email: string): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(201);
    const body = this.lastResponse.json();
    expect(body.helperId).toBeDefined();
  }

  async assertHelperInDatabase(
    email: string,
    firstname: string,
    lastname: string
  ): Promise<void> {
    const { data: helper } = await this.supabase
      .from("helpers")
      .select("*")
      .eq("email", email)
      .single();

    expect(helper).toBeDefined();
    expect(helper.email).toBe(email);
    expect(helper.firstname).toBe(firstname);
    expect(helper.lastname).toBe(lastname);
  }

  async assertHelperAccountInAuth(email: string): Promise<void> {
    const { data: authData } = await this.supabase.auth.admin.listUsers();
    const authUser = authData.users.find((u) => u.email === email);

    expect(authUser).toBeDefined();
    expect(authUser?.email).toBe(email);
  }

  async assertOnboardingFailedBecauseEmailHasAlreadyBeenRegistered(): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(400);
    const body = this.lastResponse.json();
    expect(body.error).toBeDefined();
  }

  async assertHelperDetailsNotChanged(
    email: string,
    expectedFirstname: string,
    expectedLastname: string
  ): Promise<void> {
    const { data: helper } = await this.supabase
      .from("helpers")
      .select("*")
      .eq("email", email)
      .single();

    expect(helper).not.toBeNull();
    expect(helper.firstname).toBe(expectedFirstname);
    expect(helper.lastname).toBe(expectedLastname);
  }

  async assertOnlyOneNotificationSent(): Promise<void> {
    expect(this.notificationService.send).toHaveBeenCalledOnce();
  }
}
