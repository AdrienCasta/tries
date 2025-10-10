import { expect } from "vitest";

import { OnboardHelperCommand } from "../OnboardHelper.command.js";
import {
  OnboardHelper,
  OnboardHelperResult,
} from "../OnboardHelper.usecase.js";
import { InMemoryHelperRepository } from "@infrastructure/persistence/InMemoryHelperRepository.js";
import { InMemoryHelperAccountRepository } from "@infrastructure/persistence/InMemoryHelperAccountRepository.js";
import { FakeOnboardedHelperNotificationService } from "@infrastructure/notifications/InMemoryOnboardingHelperNotificationService.js";
import { FixedClock } from "@infrastructure/time/FixedClock.js";
import { Failure, Result } from "@shared/infrastructure/Result.js";
import DomainError from "@shared/domain/DomainError.js";

export default class OnboardHelperUnitHarnessTest {
  private helperRepository!: InMemoryHelperRepository;
  private helperAccountRepository!: InMemoryHelperAccountRepository;
  private notificationService!: FakeOnboardedHelperNotificationService;
  private clock!: FixedClock;
  private useCase!: OnboardHelper;
  private usecaseResult!: Awaited<OnboardHelperResult>;

  setup(date?: Date): void {
    this.helperRepository = new InMemoryHelperRepository();
    this.helperAccountRepository = new InMemoryHelperAccountRepository();
    this.notificationService = new FakeOnboardedHelperNotificationService({
      companyName: "Tries",
      supportEmailContact: "tries@support.fr",
      passwordSetupUrl: "https://tries.fr/setup-password",
    });
    this.clock = new FixedClock(date);

    this.useCase = new OnboardHelper(
      this.helperRepository,
      this.helperAccountRepository,
      this.notificationService,
      this.clock
    );
  }

  async onboardUser(command: OnboardHelperCommand) {
    this.usecaseResult = await this.useCase.execute(command);
  }

  async assertHelperOnboarded(email: string): Promise<void> {
    expect(await this.isHelperOnboarded(email)).toBe(true);
  }

  async assertHelperIsNotOnboarded(email: string): Promise<void> {
    expect(await this.isHelperOnboarded(email)).toBe(false);
  }

  async assertHelperIsNotOnboardedWithError(
    email: string,
    errorCode: string
  ): Promise<void> {
    expect(await this.isHelperOnboarded(email)).toBe(false);
    expect((this.usecaseResult as Failure<DomainError>).error.code).toBe(
      errorCode
    );
  }

  private async isHelperOnboarded(email: string): Promise<boolean> {
    const helper = await this.helperAccountRepository.findByEmail(email);
    return (
      !!helper &&
      this.usecaseResult !== null &&
      Result.isSuccess(this.usecaseResult)
    );
  }

  async hasReceivedNotification(email: string): Promise<boolean> {
    return await this.notificationService.hasSentTo(email);
  }

  async getNotificationContent(email: string): Promise<string | null> {
    return await this.notificationService.getNotificationContent(email);
  }

  async assertNotificationSent(email: string): Promise<void> {
    const notificationSent = await this.notificationService.hasSentTo(email);
    expect(notificationSent).toBe(true);
  }

  async assertNotificationNotSent(email: string): Promise<void> {
    const notificationSent = await this.notificationService.hasSentTo(email);
    expect(notificationSent).toBe(false);
  }

  async assertHelperDetailsNotChanged(
    email: string,
    expectedFirstname: string,
    expectedLastname: string
  ): Promise<void> {
    const helper = await this.helperRepository.findByEmail(email);
    expect(helper).toBeDefined();
    expect(helper?.firstname.value).toBe(expectedFirstname);
    expect(helper?.lastname.value).toBe(expectedLastname);
  }

  async assertOnlyOneNotificationSentTo(email: string): Promise<void> {
    const notificationCount =
      await this.notificationService.getNotificationCount(email);
    expect(notificationCount).toBe(1);
  }

  simulateInfrastructureFailure(): void {
    this.helperAccountRepository.simulateFailure();
  }

  simulateHelperRepositoryFailure(): void {
    this.helperRepository.simulateFailure();
  }

  async assertHelperAccountCreated(email: string): Promise<void> {
    const account = await this.helperAccountRepository.findByEmail(email);
    expect(account).not.toBeNull();
  }

  async assertHelperAccountDeleted(email: string): Promise<void> {
    const account = await this.helperAccountRepository.findByEmail(email);
    expect(account).toBeNull();
  }
}
