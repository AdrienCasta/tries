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
      Given('helper "Frank Martin" has confirmed their email', () => {
        harness.seedHelper({
          firstname: "Frank",
          lastname: "Martin",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"Frank Martin" has submitted their professional credentials', () => {
        harness.updateHelper("Frank", "Martin", { credentialsSubmitted: true });
      });

      And('"Frank Martin" has submitted their background screening', () => {
        harness.updateHelper("Frank", "Martin", { backgroundCheckSubmitted: true });
      });

      And('"Frank Martin" requires admin attention', () => {
        expect(harness.doesHelperRequireAttention("Frank", "Martin")).toBe(true);
      });

      When('I start reviewing "Frank Martin"', async () => {
        await harness.startReview("Frank", "Martin");
      });

      Then('"Frank Martin" should be under review', () => {
        expect(harness.isUnderReview("Frank", "Martin")).toBe(true);
      });
    });

    Scenario("Cannot resubmit credentials while under review", ({ Given, When, Then, And }) => {
      Given('helper "Grace Wilson" is under review', () => {
        harness.seedHelper({
          firstname: "Grace",
          lastname: "Wilson",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          underReview: true,
        });
      });

      When('"Grace Wilson" attempts to resubmit their professional credentials', async () => {
        await harness.attemptResubmitCredentials("Grace", "Wilson");
      });

      Then('resubmission should fail with error "Cannot resubmit documents while under admin review"', () => {
        expect(harness.getLastResubmissionError()).toBe("Cannot resubmit documents while under admin review");
      });

      And('"Grace Wilson" should remain under review', () => {
        expect(harness.isUnderReview("Grace", "Wilson")).toBe(true);
      });
    });

    Scenario("Cannot resubmit background check while under review", ({ Given, When, Then, And }) => {
      Given('helper "Henry Lee" is under review', () => {
        harness.seedHelper({
          firstname: "Henry",
          lastname: "Lee",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          underReview: true,
        });
      });

      When('"Henry Lee" attempts to resubmit their background screening', async () => {
        await harness.attemptResubmitBackgroundCheck("Henry", "Lee");
      });

      Then('resubmission should fail with error "Cannot resubmit documents while under admin review"', () => {
        expect(harness.getLastResubmissionError()).toBe("Cannot resubmit documents while under admin review");
      });

      And('"Henry Lee" should remain under review', () => {
        expect(harness.isUnderReview("Henry", "Lee")).toBe(true);
      });
    });

    Scenario("Validating helper completes review", ({ Given, When, Then, And }) => {
      Given('helper "Iris Brown" is under review', () => {
        harness.seedHelper({
          firstname: "Iris",
          lastname: "Brown",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          underReview: true,
        });
      });

      When('I validate "Iris Brown"\'s profile', async () => {
        await harness.validateHelper("Iris", "Brown");
      });

      Then('"Iris Brown" should not be under review', () => {
        expect(harness.isUnderReview("Iris", "Brown")).toBe(false);
      });

      And('"Iris Brown" can apply to events', () => {
        expect(harness.canApplyToEvents("Iris", "Brown")).toBe(true);
      });
    });

    Scenario("Rejecting helper completes review", ({ Given, When, Then, And }) => {
      Given('helper "Jack Smith" is under review', () => {
        harness.seedHelper({
          firstname: "Jack",
          lastname: "Smith",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          underReview: true,
        });
      });

      When('I reject "Jack Smith" with reason "Invalid credentials"', async () => {
        await harness.rejectHelper("Jack", "Smith", "Invalid credentials");
      });

      Then('"Jack Smith" should not be under review', () => {
        expect(harness.isUnderReview("Jack", "Smith")).toBe(false);
      });

      And('"Jack Smith" cannot apply to events', () => {
        expect(harness.canApplyToEvents("Jack", "Smith")).toBe(false);
      });

      And('"Jack Smith" should not require admin attention', () => {
        expect(harness.doesHelperRequireAttention("Jack", "Smith")).toBe(false);
      });
    });

    Scenario("Helper can resubmit after rejection", ({ Given, When, Then, And }) => {
      Given('helper "Karen Davis" was rejected', () => {
        harness.seedHelper({
          firstname: "Karen",
          lastname: "Davis",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          rejected: true,
          underReview: false,
        });
      });

      And('"Karen Davis" is not under review', () => {
        expect(harness.isUnderReview("Karen", "Davis")).toBe(false);
      });

      When('"Karen Davis" resubmits their professional credentials', async () => {
        await harness.resubmitCredentials("Karen", "Davis");
      });

      Then('"Karen Davis" rejection should be cleared', () => {
        expect(harness.isRejected("Karen", "Davis")).toBe(false);
      });

      And('"Karen Davis" should require admin attention', () => {
        expect(harness.doesHelperRequireAttention("Karen", "Davis")).toBe(true);
      });
    });
  }
);

class InMemoryHelperNotificationService {
  notifyValidated(firstname: string, lastname: string): void {}
  notifyRejected(firstname: string, lastname: string, reason?: string): void {}
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

  updateHelper(firstname: string, lastname: string, updates: any) {
    this.helperRepository.update(firstname, lastname, updates);
  }

  async startReview(firstname: string, lastname: string) {
    await this.startReviewUsecase.execute(firstname, lastname);
  }

  async resubmitCredentials(firstname: string, lastname: string) {
    const result = await this.resubmitCredentialsUsecase.execute(firstname, lastname);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async attemptResubmitCredentials(firstname: string, lastname: string) {
    const result = await this.resubmitCredentialsUsecase.execute(firstname, lastname);
    if (Result.isFailure(result)) {
      this.lastResubmissionError = result.error.message;
    } else {
      this.lastResubmissionError = null;
    }
  }

  async attemptResubmitBackgroundCheck(firstname: string, lastname: string) {
    const result = await this.resubmitBackgroundCheckUsecase.execute(firstname, lastname);
    if (Result.isFailure(result)) {
      this.lastResubmissionError = result.error.message;
    } else {
      this.lastResubmissionError = null;
    }
  }

  async validateHelper(firstname: string, lastname: string) {
    const result = await this.validateHelperUsecase.execute(firstname, lastname);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async rejectHelper(firstname: string, lastname: string, reason: string) {
    const result = await this.rejectHelperUsecase.execute(firstname, lastname, reason);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  getLastResubmissionError(): string | null {
    return this.lastResubmissionError;
  }

  isUnderReview(firstname: string, lastname: string): boolean {
    const helper = this.helperRepository.findByName(firstname, lastname);
    return helper?.underReview ?? false;
  }

  canApplyToEvents(firstname: string, lastname: string): boolean {
    return this.helperRepository.isProfileValidated(firstname, lastname);
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
      !rejected &&
      !helper.underReview
    );
  }

  isRejected(firstname: string, lastname: string): boolean {
    return this.helperRepository.isHelperRejected(firstname, lastname);
  }
}
