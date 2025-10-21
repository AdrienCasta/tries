import { expect, vi } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { HttpServer } from "@infrastructure/http/HttpServer.js";
import { createApp } from "../../../app/createApp.js";
import { FastifyHttpServer } from "@infrastructure/http/FastifyHttpServer.js";
import { SupabaseHelperRepository } from "@infrastructure/persistence/SupabaseHelperRepository.js";
import { SupabaseAuthRepository } from "@infrastructure/persistence/SupabaseAuthRepository.js";
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
export default class OnboardHelperE2eHarnessTest {
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
    const helperAccountRepository = new SupabaseAuthRepository(this.supabase);
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
      // Get user ID from auth.users
      const { data: authData } = await this.supabase.auth.admin.listUsers();
      const authUser = authData.users.find(u => u.email === email);

      if (authUser) {
        // Delete from helpers table first (due to foreign key)
        await this.supabase.from("helpers").delete().eq("id", authUser.id);
        // Then delete from auth
        await this.supabase.auth.admin.deleteUser(authUser.id);
      }
    } catch (error) {
      console.error(`Cleanup failed for ${email}:`, error);
    }
  }

  async onboardUser(command: OnboardHelperCommand): Promise<void> {
    this.lastResponse = await this.server.inject({
      method: "POST",
      url: "/api/helpers/onboard",
      payload: {
        email: command.email,
        firstname: command.firstname,
        lastname: command.lastname,
        birthdate: command.birthdate,
        phoneNumber: command.phoneNumber,
        professions: command.professions,
        residence: command.residence,
        placeOfBirth: command.placeOfBirth,
      },
    });

    this.registerEmailForCleanup(command.email);
  }

  async assertUserIsInvited(): Promise<void> {
    console.log(this.lastResponse.json());
    expect(this.lastResponse.statusCode).toBe(201);
    const body = this.lastResponse.json();
    expect(body.helperId).toBeDefined();
  }

  async assertHelperInDatabase(
    email: string,
    firstname: string,
    lastname: string
  ): Promise<void> {
    // Get user ID from auth.users first
    const { data: authData } = await this.supabase.auth.admin.listUsers();
    const authUser = authData.users.find(u => u.email === email);
    expect(authUser).toBeDefined();

    const { data: helper } = await this.supabase
      .from("helpers")
      .select("*")
      .eq("id", authUser!.id)
      .single();

    expect(helper).toBeDefined();
    expect(helper.first_name).toBe(firstname);
    expect(helper.last_name).toBe(lastname);
  }

  async assertHelperAccountInAuth(email: string): Promise<void> {
    const { data: authData } = await this.supabase.auth.admin.listUsers();
    const authUser = authData.users.find((u) => u.email === email);

    expect(authUser).toBeDefined();
    expect(authUser?.email).toBe(email);
  }

  async assertOnboardingFailedBecauseEmailHasAlreadyBeenRegistered(): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(409);
    const body = this.lastResponse.json();
    expect(body.error).toBeDefined();
  }

  async assertHelperDetailsNotChanged(
    email: string,
    expectedFirstname: string,
    expectedLastname: string
  ): Promise<void> {
    // Get user ID from auth.users first
    const { data: authData } = await this.supabase.auth.admin.listUsers();
    const authUser = authData.users.find(u => u.email === email);
    expect(authUser).toBeDefined();

    const { data: helper } = await this.supabase
      .from("helpers")
      .select("*")
      .eq("id", authUser!.id)
      .single();

    expect(helper).not.toBeNull();
    expect(helper.first_name).toBe(expectedFirstname);
    expect(helper.last_name).toBe(expectedLastname);
  }

  async assertOnlyOneNotificationSent(): Promise<void> {
    expect(this.notificationService.send).toHaveBeenCalledOnce();
  }
}
