import {
  describeFeature,
  loadFeatureFromText,
} from "@amiceli/vitest-cucumber";
// @ts-ignore
import featureContent from "../../../../../features/rejectHelper.feature?raw";
import { Result } from "@shared/infrastructure/Result";

import RejectHelper from "../rejectHelper.usecase";
import { InMemoryValidationHelperRepository } from "@infrastructure/persistence/InMemoryValidationHelperRepository";

const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario, Background }) => {
    let harness: RejectHelperTestHarness;

    BeforeEachScenario(() => {
      harness = RejectHelperTestHarness.setup();
    });

    Background(({ Given }) => {
      Given("I am authenticated as an admin", () => {});
    });

    Scenario("Reject helper to prevent event applications", ({ Given, When, Then, And }) => {
      Given('helper "jane.smith@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "jane.smith@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"jane.smith@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("jane.smith@example.com", { credentialsSubmitted: true });
      });

      And('"jane.smith@example.com" has submitted their background screening', () => {
        harness.updateHelper("jane.smith@example.com", { backgroundCheckSubmitted: true });
      });

      When('I reject "jane.smith@example.com"', async () => {
        await harness.rejectHelper("jane.smith@example.com");
      });

      Then('"jane.smith@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("jane.smith@example.com")).toBe(false);
      });

      And('"jane.smith@example.com" should no longer require my attention', () => {
        expect(harness.doesHelperRequireAttention("jane.smith@example.com")).toBe(false);
      });
    });

    Scenario("Cannot reject already rejected helper", ({ Given, When, Then, And }) => {
      Given('helper "mike.ross@example.com" is already rejected', () => {
        harness.seedHelper({
          email: "mike.ross@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          rejected: true,
        });
      });

      When('I attempt to reject "mike.ross@example.com"', async () => {
        await harness.attemptRejectHelper("mike.ross@example.com");
      });

      Then('rejection should fail with error "Helper is already rejected"', () => {
        expect(harness.getLastRejectionError()).toBe("Helper is already rejected");
      });

      And('"mike.ross@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("mike.ross@example.com")).toBe(false);
      });
    });

    Scenario("Notify helper when rejected", ({ Given, When, Then, And }) => {
      Given('helper "tom.wilson@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "tom.wilson@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"tom.wilson@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("tom.wilson@example.com", { credentialsSubmitted: true });
      });

      And('"tom.wilson@example.com" has submitted their background screening', () => {
        harness.updateHelper("tom.wilson@example.com", { backgroundCheckSubmitted: true });
      });

      When('I reject "tom.wilson@example.com"', async () => {
        await harness.rejectHelper("tom.wilson@example.com");
      });

      Then('"tom.wilson@example.com" should receive a rejection notification', () => {
        expect(harness.wasRejectionNotificationSent("tom.wilson@example.com")).toBe(true);
      });
    });

    Scenario("Cannot reject helper with unconfirmed email", ({ Given, When, Then, And }) => {
      Given('helper "emma.white@example.com" has not confirmed their email', () => {
        harness.seedHelper({
          email: "emma.white@example.com",
          emailConfirmed: false,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"emma.white@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("emma.white@example.com", { credentialsSubmitted: true });
      });

      And('"emma.white@example.com" has submitted their background screening', () => {
        harness.updateHelper("emma.white@example.com", { backgroundCheckSubmitted: true });
      });

      When('I attempt to reject "emma.white@example.com"', async () => {
        await harness.attemptRejectHelper("emma.white@example.com");
      });

      Then('rejection should fail with error "Cannot reject helper with unconfirmed email"', () => {
        expect(harness.getLastRejectionError()).toBe("Cannot reject helper with unconfirmed email");
      });

      And('"emma.white@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("emma.white@example.com")).toBe(false);
      });
    });

    Scenario("Reject helper with invalid credentials reason", ({ Given, When, Then, And }) => {
      Given('helper "david.clark@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "david.clark@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"david.clark@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("david.clark@example.com", { credentialsSubmitted: true });
      });

      And('"david.clark@example.com" has submitted their background screening', () => {
        harness.updateHelper("david.clark@example.com", { backgroundCheckSubmitted: true });
      });

      When('I reject "david.clark@example.com" with reason "Invalid professional credentials"', async () => {
        await harness.rejectHelperWithReason("david.clark@example.com", "Invalid professional credentials");
      });

      Then('"david.clark@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("david.clark@example.com")).toBe(false);
      });

      And('"david.clark@example.com" rejection reason should be "Invalid professional credentials"', () => {
        expect(harness.getRejectionReason("david.clark@example.com")).toBe("Invalid professional credentials");
      });

      And('"david.clark@example.com" should receive a rejection notification with reason', () => {
        expect(harness.wasRejectionNotificationSentWithReason("david.clark@example.com")).toBe(true);
      });
    });

    Scenario("Reject helper with failed background check reason", ({ Given, When, Then, And }) => {
      Given('helper "nancy.lee@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "nancy.lee@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"nancy.lee@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("nancy.lee@example.com", { credentialsSubmitted: true });
      });

      And('"nancy.lee@example.com" has submitted their background screening', () => {
        harness.updateHelper("nancy.lee@example.com", { backgroundCheckSubmitted: true });
      });

      When('I reject "nancy.lee@example.com" with reason "Failed background screening"', async () => {
        await harness.rejectHelperWithReason("nancy.lee@example.com", "Failed background screening");
      });

      Then('"nancy.lee@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("nancy.lee@example.com")).toBe(false);
      });

      And('"nancy.lee@example.com" rejection reason should be "Failed background screening"', () => {
        expect(harness.getRejectionReason("nancy.lee@example.com")).toBe("Failed background screening");
      });

      And('"nancy.lee@example.com" should receive a rejection notification with reason', () => {
        expect(harness.wasRejectionNotificationSentWithReason("nancy.lee@example.com")).toBe(true);
      });
    });

    Scenario("Cannot reject without providing a reason", ({ Given, When, Then, And }) => {
      Given('helper "paul.gray@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "paul.gray@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"paul.gray@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("paul.gray@example.com", { credentialsSubmitted: true });
      });

      And('"paul.gray@example.com" has submitted their background screening', () => {
        harness.updateHelper("paul.gray@example.com", { backgroundCheckSubmitted: true });
      });

      When('I attempt to reject "paul.gray@example.com" without a reason', async () => {
        await harness.attemptRejectHelperWithReason("paul.gray@example.com", "");
      });

      Then('rejection should fail with error "Rejection reason is required"', () => {
        expect(harness.getLastRejectionError()).toBe("Rejection reason is required");
      });

      And('"paul.gray@example.com" should not be rejected', () => {
        expect(harness.isHelperRejected("paul.gray@example.com")).toBe(false);
      });
    });
  }
);

class InMemoryHelperNotificationService {
  private rejectionNotifications: Set<string> = new Set();
  private rejectionNotificationsWithReason: Map<string, string> = new Map();

  notifyRejected(email: string, reason?: string): void {
    this.rejectionNotifications.add(email);
    if (reason) {
      this.rejectionNotificationsWithReason.set(email, reason);
    }
  }

  wasNotified(email: string): boolean {
    return this.rejectionNotifications.has(email);
  }

  wasNotifiedWithReason(email: string): boolean {
    return this.rejectionNotificationsWithReason.has(email);
  }
}

class RejectHelperTestHarness {
  private lastRejectionError: string | null = null;

  private constructor(
    private readonly helperRepository: InMemoryValidationHelperRepository,
    private readonly notificationService: InMemoryHelperNotificationService,
    private readonly rejectHelperUsecase: RejectHelper
  ) {}

  static setup() {
    const helperRepository = new InMemoryValidationHelperRepository();
    const notificationService = new InMemoryHelperNotificationService();
    const rejectHelper = new RejectHelper(helperRepository, notificationService);
    return new this(helperRepository, notificationService, rejectHelper);
  }

  seedHelper(helper: any) {
    this.helperRepository.add(helper);
  }

  updateHelper(email: string, updates: any) {
    this.helperRepository.update(email, updates);
  }

  async rejectHelper(email: string) {
    const result = await this.rejectHelperUsecase.execute(email);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async attemptRejectHelper(email: string) {
    const result = await this.rejectHelperUsecase.execute(email);
    if (Result.isFailure(result)) {
      this.lastRejectionError = result.error.message;
    } else {
      this.lastRejectionError = null;
    }
  }

  getLastRejectionError(): string | null {
    return this.lastRejectionError;
  }

  canApplyToEvents(email: string): boolean {
    const rejected = this.helperRepository.isHelperRejected(email);
    const validated = this.helperRepository.isProfileValidated(email);
    return validated && !rejected;
  }

  doesHelperRequireAttention(email: string): boolean {
    const helper = this.helperRepository.findByEmail(email);
    if (!helper) return false;
    const rejected = this.helperRepository.isHelperRejected(email);
    return (
      helper.emailConfirmed &&
      helper.credentialsSubmitted &&
      helper.backgroundCheckSubmitted &&
      !helper.profileValidated &&
      !rejected
    );
  }

  wasRejectionNotificationSent(email: string): boolean {
    return this.notificationService.wasNotified(email);
  }

  async rejectHelperWithReason(email: string, reason: string) {
    const result = await this.rejectHelperUsecase.execute(email, reason);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async attemptRejectHelperWithReason(email: string, reason: string) {
    const result = await this.rejectHelperUsecase.execute(email, reason);
    if (Result.isFailure(result)) {
      this.lastRejectionError = result.error.message;
    } else {
      this.lastRejectionError = null;
    }
  }

  getRejectionReason(email: string): string | undefined {
    const helper = this.helperRepository.findByEmail(email);
    return helper?.rejectionReason;
  }

  wasRejectionNotificationSentWithReason(email: string): boolean {
    return this.notificationService.wasNotifiedWithReason(email);
  }

  isHelperRejected(email: string): boolean {
    return this.helperRepository.isHelperRejected(email);
  }
}
