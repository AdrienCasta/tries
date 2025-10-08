import { expect } from "vitest";
import { HttpServer } from "@infrastructure/http/HttpServer.js";
import { createApp } from "../../../app/createApp.js";
import { FakeHttpServer } from "@infrastructure/http/FakeHttpServer.js";
import { InMemoryHelperRepository } from "@infrastructure/persistence/InMemoryHelperRepository.js";
import { InMemoryHelperAccountRepository } from "@infrastructure/persistence/InMemoryHelperAccountRepository.js";
import { FakeOnboardedHelperNotificationService } from "@infrastructure/notifications/InMemoryOnboardingHelperNotificationService.js";
import { FixedClock } from "@infrastructure/time/FixedClock.js";
import InMemoryEventBus from "@infrastructure/events/InMemoryEventBus.js";
import { ConfirmHelperEmailCommand } from "../ConfirmHelperEmail.command.js";
import { FakeEmailConfirmationService } from "./fakes/FakeEmailConfirmationService.js";

export default class ConfirmHelperEmailIntegrationTest {
  private server!: HttpServer;
  private helperRepository!: InMemoryHelperRepository;
  private helperAccountRepository!: InMemoryHelperAccountRepository;
  private emailConfirmationService!: FakeEmailConfirmationService;
  private lastResponse: any;
  private testToken: string = "";

  async setup(): Promise<void> {
    this.helperRepository = new InMemoryHelperRepository();
    this.helperAccountRepository = new InMemoryHelperAccountRepository();
    this.emailConfirmationService = new FakeEmailConfirmationService();

    const fakeServer = new FakeHttpServer();
    this.server = createApp(fakeServer, {
      helperRepository: this.helperRepository,
      helperAccountRepository: this.helperAccountRepository,
      notificationService: new FakeOnboardedHelperNotificationService({
        companyName: "Tries",
        supportEmailContact: "tries@support.fr",
        passwordSetupUrl: "https://tries.fr/setup-password",
      }),
      clock: new FixedClock(new Date("2025-01-15T10:00:00Z")),
      eventBus: new InMemoryEventBus(),
      emailConfirmationService: this.emailConfirmationService,
    });

    await this.server.ready();
  }

  async teardown(): Promise<void> {
    await this.server.close();
  }

  givenHelperAccountExists(email: string): void {
    this.testToken = "valid-token-" + Math.random().toString(36).substring(7);
    this.emailConfirmationService.registerToken(this.testToken);
  }

  givenTokenIsExpired(): void {
    this.emailConfirmationService.markTokenAsExpired(this.testToken);
  }

  givenEmailAlreadyConfirmed(): void {
    this.emailConfirmationService.markEmailAsConfirmed(this.testToken);
  }

  async confirmEmail(command: ConfirmHelperEmailCommand): Promise<void> {
    this.lastResponse = await this.server.inject({
      method: "POST",
      url: "/api/helpers/confirm-email",
      payload: command,
    });
  }

  async confirmEmailWithToken(token: string): Promise<void> {
    await this.confirmEmail(new ConfirmHelperEmailCommand(token));
  }

  getValidToken(): string {
    return this.testToken;
  }

  async assertEmailConfirmed(): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(200);
    const body = this.lastResponse.json();
    expect(body.message).toBe("Email confirmed successfully");
  }

  async assertConfirmationFailed(statusCode: number, errorCode: string): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(statusCode);
    const body = this.lastResponse.json();
    expect(body.code).toBe(errorCode);
  }
}
