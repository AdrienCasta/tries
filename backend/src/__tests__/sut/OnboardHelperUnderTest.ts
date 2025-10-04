import { expect } from "vitest";

import { User } from "../../domain/entities/User.js";
import { OnboardHelper } from "../../application/use-cases/OnboardHelper.js";
import { InMemoryHelperRepository } from "../../infrastructure/repositories/InMemoryHelperRepository.js";
import { InMemoryHelperAccountRepository } from "../../infrastructure/repositories/InMemoryHelperAccountRepository.js";
import { FakeOnboardedHelperNotificationService } from "../../infrastructure/services/InMemoryOnboardingHelperNotificationService.js";
import { Helper } from "../../domain/entities/Helper.js";
import { FixedClock } from "../doubles/FixedClock.js";
import InvalidEmailError from "../../domain/errors/InvalidEmailError.js";
import ValidationError from "../../domain/errors/ValidationError.js";
import LastameError from "../../domain/errors/LastameError.js";
import FirstameError from "../../domain/errors/FirstameError.js";

export default class OnboardHelperUnderTest {
  private helperRepository!: InMemoryHelperRepository;
  private helperAccountRepository!: InMemoryHelperAccountRepository;
  private notificationService!: FakeOnboardedHelperNotificationService;
  private clock!: FixedClock;
  private useCase!: OnboardHelper;
  private lastError: Error | null = null;

  setup(): void {
    this.helperRepository = new InMemoryHelperRepository();
    this.helperAccountRepository = new InMemoryHelperAccountRepository();
    this.notificationService = new FakeOnboardedHelperNotificationService({
      companyName: "Tries",
      supportEmailContact: "tries@support.fr",
      passwordSetupUrl: "https://tries.fr/setup-password",
    });
    this.clock = new FixedClock();
    this.lastError = null;

    this.useCase = new OnboardHelper(
      this.helperRepository,
      this.helperAccountRepository,
      this.notificationService,
      this.clock
    );
  }

  async onboardUser(user: User) {
    const result = await this.useCase.execute(user);
    if (!result.success) {
      this.lastError = result.error;
    }
    return result;
  }

  async assertHelperOnboarded(email: string): Promise<void> {
    const helper = await this.helperRepository.findByEmail(email);
    expect(helper).toBeDefined();
    expect(helper).not.toBeNull();
  }

  async isHelperOnboarded(email: string): Promise<boolean> {
    const helper = await this.helperRepository.findByEmail(email);
    return helper !== null;
  }

  async hasReceivedNotification(email: string): Promise<boolean> {
    return await this.notificationService.hasSentTo(email);
  }

  async getNotificationContent(email: string): Promise<string | null> {
    return await this.notificationService.getNotificationContent(email);
  }
  async findHelperByEmail(email: string): Promise<Helper | null> {
    return this.helperRepository.findByEmail(email);
  }

  clearNotification() {
    this.notificationService.clear();
  }

  async assertOnboardingFailedWithError(
    expectedErrorMessage: string
  ): Promise<void> {
    expect(this.lastError).toBeInstanceOf(InvalidEmailError);
  }

  async assertOnboardingFailedWithNameValidationError(
    expectedErrorMessage: string
  ): Promise<void> {
    expect(this.lastError).toBeInstanceOf(ValidationError);
    expect(this.lastError?.message).toBe(expectedErrorMessage);
  }

  async assertHelperNotOnboarded(email: string): Promise<void> {
    const helper = await this.helperRepository.findByEmail(email);
    expect(helper).toBeNull();
  }

  async assertNotificationSent(email: string): Promise<void> {
    const notificationSent = await this.notificationService.hasSentTo(email);
    expect(notificationSent).toBe(true);
  }

  async assertNotificationNotSent(email: string): Promise<void> {
    const notificationSent = await this.notificationService.hasSentTo(email);
    expect(notificationSent).toBe(false);
  }

  async assertOnboardingFailedWithDuplicateEmail(): Promise<void> {
    expect(this.lastError).toBeDefined();
    expect(this.lastError?.message).toBe("Helper with this email already exists");
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
    const notificationCount = await this.notificationService.getNotificationCount(email);
    expect(notificationCount).toBe(1);
  }
}
