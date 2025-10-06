import { expect } from "vitest";
import { HttpServer } from "@infrastructure/http/HttpServer.js";
import { createApp } from "../../../app/createApp.js";
import { FakeHttpServer } from "@infrastructure/http/FakeHttpServer.js";
import { InMemoryHelperRepository } from "@infrastructure/persistence/InMemoryHelperRepository.js";
import { InMemoryHelperAccountRepository } from "@infrastructure/persistence/InMemoryHelperAccountRepository.js";
import { InMemoryProfessionRepository } from "@infrastructure/persistence/InMemoryProfessionRepository.js";
import { FakeOnboardedHelperNotificationService } from "@infrastructure/notifications/InMemoryOnboardingHelperNotificationService.js";
import { FixedClock } from "@infrastructure/time/FixedClock.js";
import InMemoryEventBus from "@infrastructure/events/InMemoryEventBus.js";
import { OnboardHelperCommand } from "../OnboardHelper.command.js";

/**
 * Integration Test Helper for Onboard Helper Feature
 *
 * Hides technical details (HTTP, repositories, notifications) behind
 * domain-focused assertion methods. Tests should read like business scenarios.
 */
export default class OnboardHelperIntegrationTest {
  private server!: HttpServer;
  private helperRepository!: InMemoryHelperRepository;
  private helperAccountRepository!: InMemoryHelperAccountRepository;
  private professionRepository!: InMemoryProfessionRepository;
  private notificationService!: FakeOnboardedHelperNotificationService;
  private lastResponse: any;

  async setup(): Promise<void> {
    this.helperRepository = new InMemoryHelperRepository();
    this.helperAccountRepository = new InMemoryHelperAccountRepository();
    this.professionRepository = new InMemoryProfessionRepository();
    this.notificationService = new FakeOnboardedHelperNotificationService({
      companyName: "Tries",
      supportEmailContact: "tries@support.fr",
      passwordSetupUrl: "https://tries.fr/setup-password",
    });

    const fakeServer = new FakeHttpServer();
    this.server = createApp(fakeServer, {
      helperRepository: this.helperRepository,
      helperAccountRepository: this.helperAccountRepository,
      professionRepository: this.professionRepository,
      notificationService: this.notificationService,
      clock: new FixedClock(new Date("2025-01-15T10:00:00Z")),
      eventBus: new InMemoryEventBus(),
    });

    await this.server.ready();
  }

  async teardown(): Promise<void> {
    await this.server.close();
  }

  async onboardUser(command: OnboardHelperCommand): Promise<void> {
    this.lastResponse = await this.server.inject({
      method: "POST",
      url: "/api/helpers/onboard",
      payload: {
        email: command.email,
        firstname: command.firstname,
        lastname: command.lastname,
        phoneNumber: command.phoneNumber,
        professions: command.professions,
      },
    });
  }

  async assertHelperOnboarded(email: string): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(201);
    const body = this.lastResponse.json();
    expect(body.helperId).toBeDefined();
    expect(body.message).toBe("Helper successfully onboarded");
  }

  async assertNotificationSent(email: string): Promise<void> {
    const notificationSent = await this.notificationService.hasSentTo(email);
    expect(notificationSent).toBe(true);
  }

  async assertOnboardingFailedWithError(expectedError: string): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(400);
    const body = this.lastResponse.json();
    expect(body.error).toBe(expectedError);
  }

  async assertHelperNotOnboarded(email: string): Promise<void> {
    const helper = await this.helperRepository.findByEmail(email);
    expect(helper).toBeNull();
  }

  async assertOnboardingFailedWithDuplicateEmail(): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(400);
    const body = this.lastResponse.json();
    expect(body.error).toBe("Helper with this email already exists");
  }

  async assertHelperDetailsNotChanged(
    email: string,
    expectedFirstname: string,
    expectedLastname: string
  ): Promise<void> {
    const helper = await this.helperRepository.findByEmail(email);
    expect(helper?.firstname.value).toBe(expectedFirstname);
    expect(helper?.lastname.value).toBe(expectedLastname);
  }

  async assertOnlyOneNotificationSentTo(email: string): Promise<void> {
    const notificationCount =
      await this.notificationService.getNotificationCount(email);
    expect(notificationCount).toBe(1);
  }

  simulateSystemUnavailable(): void {
    this.helperAccountRepository.simulateFailure();
  }

  async assertOnboardingFailed(): Promise<void> {
    expect(this.lastResponse.statusCode).toBe(400);
    const body = this.lastResponse.json();
    expect(body.error).toBeDefined();
  }

  async assertNotificationNotSent(email: string): Promise<void> {
    const notificationSent = await this.notificationService.hasSentTo(email);
    expect(notificationSent).toBe(false);
  }
}
