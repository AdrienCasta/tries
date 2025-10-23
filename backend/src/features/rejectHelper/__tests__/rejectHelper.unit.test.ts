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
      Given('helper "Jane Smith" has confirmed their email', () => {
        harness.seedHelper({
          firstname: "Jane",
          lastname: "Smith",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"Jane Smith" has submitted their professional credentials', () => {
        harness.updateHelper("Jane", "Smith", { credentialsSubmitted: true });
      });

      And('"Jane Smith" has submitted their background screening', () => {
        harness.updateHelper("Jane", "Smith", { backgroundCheckSubmitted: true });
      });

      When('I reject "Jane Smith"', async () => {
        await harness.rejectHelper("Jane", "Smith");
      });

      Then('"Jane Smith" cannot apply to events', () => {
        expect(harness.canApplyToEvents("Jane", "Smith")).toBe(false);
      });

      And('"Jane Smith" should no longer require my attention', () => {
        expect(harness.doesHelperRequireAttention("Jane", "Smith")).toBe(false);
      });
    });

    Scenario("Cannot reject already rejected helper", ({ Given, When, Then, And }) => {
      Given('helper "Mike Ross" is already rejected', () => {
        harness.seedHelper({
          firstname: "Mike",
          lastname: "Ross",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          rejected: true,
        });
      });

      When('I attempt to reject "Mike Ross"', async () => {
        await harness.attemptRejectHelper("Mike", "Ross");
      });

      Then('rejection should fail with error "Helper is already rejected"', () => {
        expect(harness.getLastRejectionError()).toBe("Helper is already rejected");
      });

      And('"Mike Ross" cannot apply to events', () => {
        expect(harness.canApplyToEvents("Mike", "Ross")).toBe(false);
      });
    });

    Scenario("Notify helper when rejected", ({ Given, When, Then, And }) => {
      Given('helper "Tom Wilson" has confirmed their email', () => {
        harness.seedHelper({
          firstname: "Tom",
          lastname: "Wilson",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"Tom Wilson" has submitted their professional credentials', () => {
        harness.updateHelper("Tom", "Wilson", { credentialsSubmitted: true });
      });

      And('"Tom Wilson" has submitted their background screening', () => {
        harness.updateHelper("Tom", "Wilson", { backgroundCheckSubmitted: true });
      });

      When('I reject "Tom Wilson"', async () => {
        await harness.rejectHelper("Tom", "Wilson");
      });

      Then('"Tom Wilson" should receive a rejection notification', () => {
        expect(harness.wasRejectionNotificationSent("Tom", "Wilson")).toBe(true);
      });
    });

    Scenario("Cannot reject helper with unconfirmed email", ({ Given, When, Then, And }) => {
      Given('helper "Emma White" has not confirmed their email', () => {
        harness.seedHelper({
          firstname: "Emma",
          lastname: "White",
          emailConfirmed: false,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"Emma White" has submitted their professional credentials', () => {
        harness.updateHelper("Emma", "White", { credentialsSubmitted: true });
      });

      And('"Emma White" has submitted their background screening', () => {
        harness.updateHelper("Emma", "White", { backgroundCheckSubmitted: true });
      });

      When('I attempt to reject "Emma White"', async () => {
        await harness.attemptRejectHelper("Emma", "White");
      });

      Then('rejection should fail with error "Cannot reject helper with unconfirmed email"', () => {
        expect(harness.getLastRejectionError()).toBe("Cannot reject helper with unconfirmed email");
      });

      And('"Emma White" cannot apply to events', () => {
        expect(harness.canApplyToEvents("Emma", "White")).toBe(false);
      });
    });

    Scenario("Reject helper with invalid credentials reason", ({ Given, When, Then, And }) => {
      Given('helper "David Clark" has confirmed their email', () => {
        harness.seedHelper({
          firstname: "David",
          lastname: "Clark",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"David Clark" has submitted their professional credentials', () => {
        harness.updateHelper("David", "Clark", { credentialsSubmitted: true });
      });

      And('"David Clark" has submitted their background screening', () => {
        harness.updateHelper("David", "Clark", { backgroundCheckSubmitted: true });
      });

      When('I reject "David Clark" with reason "Invalid professional credentials"', async () => {
        await harness.rejectHelperWithReason("David", "Clark", "Invalid professional credentials");
      });

      Then('"David Clark" cannot apply to events', () => {
        expect(harness.canApplyToEvents("David", "Clark")).toBe(false);
      });

      And('"David Clark" rejection reason should be "Invalid professional credentials"', () => {
        expect(harness.getRejectionReason("David", "Clark")).toBe("Invalid professional credentials");
      });

      And('"David Clark" should receive a rejection notification with reason', () => {
        expect(harness.wasRejectionNotificationSentWithReason("David", "Clark")).toBe(true);
      });
    });

    Scenario("Reject helper with failed background check reason", ({ Given, When, Then, And }) => {
      Given('helper "Nancy Lee" has confirmed their email', () => {
        harness.seedHelper({
          firstname: "Nancy",
          lastname: "Lee",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"Nancy Lee" has submitted their professional credentials', () => {
        harness.updateHelper("Nancy", "Lee", { credentialsSubmitted: true });
      });

      And('"Nancy Lee" has submitted their background screening', () => {
        harness.updateHelper("Nancy", "Lee", { backgroundCheckSubmitted: true });
      });

      When('I reject "Nancy Lee" with reason "Failed background screening"', async () => {
        await harness.rejectHelperWithReason("Nancy", "Lee", "Failed background screening");
      });

      Then('"Nancy Lee" cannot apply to events', () => {
        expect(harness.canApplyToEvents("Nancy", "Lee")).toBe(false);
      });

      And('"Nancy Lee" rejection reason should be "Failed background screening"', () => {
        expect(harness.getRejectionReason("Nancy", "Lee")).toBe("Failed background screening");
      });

      And('"Nancy Lee" should receive a rejection notification with reason', () => {
        expect(harness.wasRejectionNotificationSentWithReason("Nancy", "Lee")).toBe(true);
      });
    });

    Scenario("Cannot reject without providing a reason", ({ Given, When, Then, And }) => {
      Given('helper "Paul Gray" has confirmed their email', () => {
        harness.seedHelper({
          firstname: "Paul",
          lastname: "Gray",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"Paul Gray" has submitted their professional credentials', () => {
        harness.updateHelper("Paul", "Gray", { credentialsSubmitted: true });
      });

      And('"Paul Gray" has submitted their background screening', () => {
        harness.updateHelper("Paul", "Gray", { backgroundCheckSubmitted: true });
      });

      When('I attempt to reject "Paul Gray" without a reason', async () => {
        await harness.attemptRejectHelperWithReason("Paul", "Gray", "");
      });

      Then('rejection should fail with error "Rejection reason is required"', () => {
        expect(harness.getLastRejectionError()).toBe("Rejection reason is required");
      });

      And('"Paul Gray" should not be rejected', () => {
        expect(harness.isHelperRejected("Paul", "Gray")).toBe(false);
      });
    });
  }
);

class InMemoryHelperNotificationService {
  private rejectionNotifications: Set<string> = new Set();
  private rejectionNotificationsWithReason: Map<string, string> = new Map();

  notifyRejected(firstname: string, lastname: string, reason?: string): void {
    const key = `${firstname}:${lastname}`;
    this.rejectionNotifications.add(key);
    if (reason) {
      this.rejectionNotificationsWithReason.set(key, reason);
    }
  }

  wasNotified(firstname: string, lastname: string): boolean {
    return this.rejectionNotifications.has(`${firstname}:${lastname}`);
  }

  wasNotifiedWithReason(firstname: string, lastname: string): boolean {
    return this.rejectionNotificationsWithReason.has(`${firstname}:${lastname}`);
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

  updateHelper(firstname: string, lastname: string, updates: any) {
    this.helperRepository.update(firstname, lastname, updates);
  }

  async rejectHelper(firstname: string, lastname: string) {
    const result = await this.rejectHelperUsecase.execute(firstname, lastname);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async attemptRejectHelper(firstname: string, lastname: string) {
    const result = await this.rejectHelperUsecase.execute(firstname, lastname);
    if (Result.isFailure(result)) {
      this.lastRejectionError = result.error.message;
    } else {
      this.lastRejectionError = null;
    }
  }

  getLastRejectionError(): string | null {
    return this.lastRejectionError;
  }

  canApplyToEvents(firstname: string, lastname: string): boolean {
    const rejected = this.helperRepository.isHelperRejected(firstname, lastname);
    const validated = this.helperRepository.isProfileValidated(firstname, lastname);
    return validated && !rejected;
  }

  doesHelperRequireAttention(firstname: string, lastname: string): boolean {
    const helper = this.helperRepository.findByName(firstname, lastname);
    if (!helper) return false;
    const rejected = this.helperRepository.isHelperRejected(firstname, lastname);
    return (
      helper.emailConfirmed &&
      helper.credentialsSubmitted &&
      helper.backgroundCheckSubmitted &&
      !helper.profileValidated &&
      !rejected
    );
  }

  wasRejectionNotificationSent(firstname: string, lastname: string): boolean {
    return this.notificationService.wasNotified(firstname, lastname);
  }

  async rejectHelperWithReason(firstname: string, lastname: string, reason: string) {
    const result = await this.rejectHelperUsecase.execute(firstname, lastname, reason);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async attemptRejectHelperWithReason(firstname: string, lastname: string, reason: string) {
    const result = await this.rejectHelperUsecase.execute(firstname, lastname, reason);
    if (Result.isFailure(result)) {
      this.lastRejectionError = result.error.message;
    } else {
      this.lastRejectionError = null;
    }
  }

  getRejectionReason(firstname: string, lastname: string): string | undefined {
    const helper = this.helperRepository.findByName(firstname, lastname);
    return helper?.rejectionReason;
  }

  wasRejectionNotificationSentWithReason(firstname: string, lastname: string): boolean {
    return this.notificationService.wasNotifiedWithReason(firstname, lastname);
  }

  isHelperRejected(firstname: string, lastname: string): boolean {
    return this.helperRepository.isHelperRejected(firstname, lastname);
  }
}
