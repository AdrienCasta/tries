import {
  describeFeature,
  loadFeatureFromText,
} from "@amiceli/vitest-cucumber";
import featureContent from "../../../../../features/reviewProcess.feature?raw";
import { Result } from "@shared/infrastructure/Result";

import StartReview from "../StartReview.usecase";
import ResubmitCredentials from "../../resubmitHelperDocuments/ResubmitCredentials.usecase";
import ResubmitBackgroundCheck from "../../resubmitHelperDocuments/ResubmitBackgroundCheck.usecase";
import ValidateHelper from "../../validateHelper/validateHelper.usecase";
import RejectHelper from "../../rejectHelper/rejectHelper.usecase";
import { InMemoryValidationHelperRepository } from "@infrastructure/persistence/InMemoryValidationHelperRepository";

const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario, Background }) => {
    let harness: LockHelperDocumentsTestHarness;

    BeforeEachScenario(() => {
      harness = LockHelperDocumentsTestHarness.setup();
    });

    Background(({ Given }) => {
      Given("I am authenticated as an admin", () => {});
    });

    Scenario("Admin starts reviewing helper", ({ Given, When, Then, And }) => {
      Given('helper "frank.martin@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "frank.martin@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"frank.martin@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("frank.martin@example.com", { credentialsSubmitted: true });
      });

      And('"frank.martin@example.com" has submitted their background screening', () => {
        harness.updateHelper("frank.martin@example.com", { backgroundCheckSubmitted: true });
      });

      And('"frank.martin@example.com" requires admin attention', () => {
        expect(harness.doesHelperRequireAttention("frank.martin@example.com")).toBe(true);
      });

      When('I start reviewing "frank.martin@example.com"', async () => {
        await harness.startReview("frank.martin@example.com");
      });

      Then('"frank.martin@example.com" should be under review', () => {
        expect(harness.isUnderReview("frank.martin@example.com")).toBe(true);
      });
    });

    Scenario("Cannot resubmit credentials while under review", ({ Given, When, Then, And }) => {
      Given('helper "grace.wilson@example.com" is under review', () => {
        harness.seedHelper({
          email: "grace.wilson@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          underReview: true,
        });
      });

      When('"grace.wilson@example.com" attempts to resubmit their professional credentials', async () => {
        await harness.attemptResubmitCredentials("grace.wilson@example.com");
      });

      Then('resubmission should fail with error "Cannot resubmit documents while under admin review"', () => {
        expect(harness.getLastResubmissionError()).toBe("Cannot resubmit documents while under admin review");
      });

      And('"grace.wilson@example.com" should remain under review', () => {
        expect(harness.isUnderReview("grace.wilson@example.com")).toBe(true);
      });
    });

    Scenario("Cannot resubmit background check while under review", ({ Given, When, Then, And }) => {
      Given('helper "henry.lee@example.com" is under review', () => {
        harness.seedHelper({
          email: "henry.lee@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          underReview: true,
        });
      });

      When('"henry.lee@example.com" attempts to resubmit their background screening', async () => {
        await harness.attemptResubmitBackgroundCheck("henry.lee@example.com");
      });

      Then('resubmission should fail with error "Cannot resubmit documents while under admin review"', () => {
        expect(harness.getLastResubmissionError()).toBe("Cannot resubmit documents while under admin review");
      });

      And('"henry.lee@example.com" should remain under review', () => {
        expect(harness.isUnderReview("henry.lee@example.com")).toBe(true);
      });
    });

    Scenario("Validating helper completes review", ({ Given, When, Then, And }) => {
      Given('helper "iris.brown@example.com" is under review', () => {
        harness.seedHelper({
          email: "iris.brown@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          underReview: true,
        });
      });

      When('I validate "iris.brown@example.com"', async () => {
        await harness.validateHelper("iris.brown@example.com");
      });

      Then('"iris.brown@example.com" should not be under review', () => {
        expect(harness.isUnderReview("iris.brown@example.com")).toBe(false);
      });

      And('"iris.brown@example.com" can apply to events', () => {
        expect(harness.canApplyToEvents("iris.brown@example.com")).toBe(true);
      });
    });

    Scenario("Rejecting helper completes review", ({ Given, When, Then, And }) => {
      Given('helper "jack.smith@example.com" is under review', () => {
        harness.seedHelper({
          email: "jack.smith@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          underReview: true,
        });
      });

      When('I reject "jack.smith@example.com" with reason "Invalid credentials"', async () => {
        await harness.rejectHelper("jack.smith@example.com", "Invalid credentials");
      });

      Then('"jack.smith@example.com" should not be under review', () => {
        expect(harness.isUnderReview("jack.smith@example.com")).toBe(false);
      });

      And('"jack.smith@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("jack.smith@example.com")).toBe(false);
      });

      And('"jack.smith@example.com" should not require admin attention', () => {
        expect(harness.doesHelperRequireAttention("jack.smith@example.com")).toBe(false);
      });
    });

    Scenario("Helper can resubmit after rejection", ({ Given, When, Then, And }) => {
      Given('helper "karen.davis@example.com" was rejected', () => {
        harness.seedHelper({
          email: "karen.davis@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          rejected: true,
          underReview: false,
        });
      });

      And('"karen.davis@example.com" is not under review', () => {
        expect(harness.isUnderReview("karen.davis@example.com")).toBe(false);
      });

      When('"karen.davis@example.com" resubmits their professional credentials', async () => {
        await harness.resubmitCredentials("karen.davis@example.com");
      });

      Then('"karen.davis@example.com" rejection should be cleared', () => {
        expect(harness.isRejected("karen.davis@example.com")).toBe(false);
      });

      And('"karen.davis@example.com" should require admin attention', () => {
        expect(harness.doesHelperRequireAttention("karen.davis@example.com")).toBe(true);
      });
    });
  }
);

class InMemoryHelperNotificationService {
  notifyValidated(email: string): void {}
  notifyRejected(email: string, reason?: string): void {}
}

class LockHelperDocumentsTestHarness {
  private lastResubmissionError: string | null = null;

  private constructor(
    private readonly helperRepository: InMemoryValidationHelperRepository,
    private readonly startReviewUsecase: StartReview,
    private readonly resubmitCredentialsUsecase: ResubmitCredentials,
    private readonly resubmitBackgroundCheckUsecase: ResubmitBackgroundCheck,
    private readonly validateHelperUsecase: ValidateHelper,
    private readonly rejectHelperUsecase: RejectHelper
  ) {}

  static setup() {
    const helperRepository = new InMemoryValidationHelperRepository();
    const notificationService = new InMemoryHelperNotificationService();
    const startReview = new StartReview(helperRepository);
    const resubmitCredentials = new ResubmitCredentials(helperRepository);
    const resubmitBackgroundCheck = new ResubmitBackgroundCheck(helperRepository);
    const validateHelper = new ValidateHelper(helperRepository, notificationService);
    const rejectHelper = new RejectHelper(helperRepository, notificationService);
    return new this(
      helperRepository,
      startReview,
      resubmitCredentials,
      resubmitBackgroundCheck,
      validateHelper,
      rejectHelper
    );
  }

  seedHelper(helper: any) {
    this.helperRepository.add(helper);
  }

  updateHelper(email: string, updates: any) {
    this.helperRepository.update(email, updates);
  }

  async startReview(email: string) {
    await this.startReviewUsecase.execute(email);
  }

  async resubmitCredentials(email: string) {
    const result = await this.resubmitCredentialsUsecase.execute(email);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async attemptResubmitCredentials(email: string) {
    const result = await this.resubmitCredentialsUsecase.execute(email);
    if (Result.isFailure(result)) {
      this.lastResubmissionError = result.error.message;
    } else {
      this.lastResubmissionError = null;
    }
  }

  async attemptResubmitBackgroundCheck(email: string) {
    const result = await this.resubmitBackgroundCheckUsecase.execute(email);
    if (Result.isFailure(result)) {
      this.lastResubmissionError = result.error.message;
    } else {
      this.lastResubmissionError = null;
    }
  }

  async validateHelper(email: string) {
    const result = await this.validateHelperUsecase.execute(email);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async rejectHelper(email: string, reason: string) {
    const result = await this.rejectHelperUsecase.execute(email, reason);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  getLastResubmissionError(): string | null {
    return this.lastResubmissionError;
  }

  isUnderReview(email: string): boolean {
    const helper = this.helperRepository.findByEmail(email);
    return helper?.underReview ?? false;
  }

  canApplyToEvents(email: string): boolean {
    return this.helperRepository.isProfileValidated(email);
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
      !rejected &&
      !helper.underReview
    );
  }

  isRejected(email: string): boolean {
    return this.helperRepository.isHelperRejected(email);
  }
}
