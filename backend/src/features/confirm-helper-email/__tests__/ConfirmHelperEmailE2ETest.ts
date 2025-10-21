import { expect, vi } from "vitest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  HttpServer,
  HttpServerInjectResponse,
} from "@infrastructure/http/HttpServer.js";
import { createApp } from "../../../app/createApp.js";
import { FastifyHttpServer } from "@infrastructure/http/FastifyHttpServer.js";
import { SupabaseHelperRepository } from "@infrastructure/persistence/SupabaseHelperRepository.js";
import { SupabaseAuthRepository } from "@infrastructure/persistence/SupabaseAuthRepository.js";
import { SupabaseOnboardedHelperNotificationService } from "@infrastructure/notifications/SupabaseOnboardedHelperNotificationService.js";
import { SupabaseEmailConfirmationService } from "@infrastructure/services/SupabaseEmailConfirmationService.js";
import { FixedClock } from "@infrastructure/time/FixedClock.js";
import InMemoryEventBus from "@infrastructure/events/InMemoryEventBus.js";
import { ConfirmHelperEmailControllerResponseBody } from "../ConfirmHelperEmail.controller.js";

export default class ConfirmHelperEmailE2ETest {
  private server!: HttpServer;
  private supabase!: SupabaseClient;
  private emailConfirmationService!: SupabaseEmailConfirmationService;
  private testEmails: string[] = [];
  private confirmEmailResponse!: HttpServerInjectResponse<ConfirmHelperEmailControllerResponseBody>;
  private validToken: string = "";

  async setup(): Promise<void> {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const helperRepository = new SupabaseHelperRepository(this.supabase);
    const helperAccountRepository = new SupabaseAuthRepository(this.supabase);
    const notificationService = new SupabaseOnboardedHelperNotificationService(
      this.supabase
    );
    notificationService.send = vi.fn();

    this.emailConfirmationService = new SupabaseEmailConfirmationService(
      this.supabase
    );

    const clock = new FixedClock(new Date("2025-01-15T10:00:00Z"));

    const fastifyServer = new FastifyHttpServer();
    this.server = createApp(fastifyServer, {
      helperRepository,
      helperAccountRepository,
      notificationService,
      emailConfirmationService: this.emailConfirmationService,
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
  }

  async createHelperWithUnconfirmedEmail(email: string): Promise<void> {
    this.registerEmailForCleanup(email);
    await this.cleanupEmail(email);

    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password: "temporary-password-123",
      email_confirm: false,
    });

    if (error) {
      throw new Error(`Failed to create helper: ${error.message}`);
    }

    const { data: linkData, error: linkError } =
      await this.supabase.auth.admin.generateLink({
        type: "signup",
        email,
        password: "temporary-password-123",
      });

    if (linkError || !linkData.properties.hashed_token) {
      throw new Error(
        `Failed to generate confirmation link: ${linkError?.message}`
      );
    }

    this.validToken = linkData.properties.hashed_token;
  }

  async createHelperWithConfirmedEmail(email: string): Promise<void> {
    this.registerEmailForCleanup(email);
    await this.cleanupEmail(email);

    await this.supabase.auth.admin.createUser({
      email,
      password: "temporary-password-123",
      email_confirm: true,
    });
  }

  async confirmEmail(token: string): Promise<void> {
    this.confirmEmailResponse =
      await this.server.inject<ConfirmHelperEmailControllerResponseBody>({
        method: "POST",
        url: "/api/helpers/confirm-email",
        payload: { token },
      });
  }

  getValidToken(): string {
    return this.validToken;
  }

  getExpiredToken(): string {
    return "expired-token-123456";
  }

  async assertEmailConfirmed(): Promise<void> {
    expect(this.confirmEmailResponse.statusCode).toBe(200);
    const body = this.confirmEmailResponse.json();
    expect("message" in body).toBe(true);
    if ("message" in body) {
      expect(body.message).toContain("confirmed");
    }
  }

  async assertConfirmationFailed(expectedErrorCode: string): Promise<void> {
    expect(this.confirmEmailResponse.statusCode).toBe(400);
    const body = this.confirmEmailResponse.json();
    expect("code" in body).toBe(true);
    if ("code" in body) {
      expect(body.code).toBe(expectedErrorCode);
    }
  }

  async assertEmailNotConfirmed(email: string): Promise<void> {
    const { data } = await this.supabase.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === email);

    expect(user).toBeDefined();
    expect(user?.email_confirmed_at).toBeUndefined();
  }

  async assertEmailIsConfirmedInDatabase(email: string): Promise<void> {
    const { data } = await this.supabase.auth.admin.listUsers();
    const user = data.users.find((u) => u.email === email);

    expect(user).toBeDefined();
    expect(user?.email_confirmed_at).toBeDefined();
  }
}
