import {
  describeFeature,
  loadFeatureFromText,
} from "@amiceli/vitest-cucumber";
import featureContent from "../../../../../features/resubmitHelperDocuments.feature?raw";

import ResubmitCredentials from "../ResubmitCredentials.usecase";
import ResubmitBackgroundCheck from "../ResubmitBackgroundCheck.usecase";
import { InMemoryValidationHelperRepository } from "@infrastructure/persistence/InMemoryValidationHelperRepository";

const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario }) => {
    let harness: ResubmitHelperDocumentsTestHarness;

    BeforeEachScenario(() => {
      harness = ResubmitHelperDocumentsTestHarness.setup();
    });

    Scenario("Validated helper resubmits credentials", ({ Given, When, Then, And }) => {
      Given('helper "robert.green@example.com" is validated', () => {
        harness.seedHelper({
          email: "robert.green@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: true,
        });
      });

      And('"robert.green@example.com" can apply to events', () => {
        expect(harness.canApplyToEvents("robert.green@example.com")).toBe(true);
      });

      When('"robert.green@example.com" resubmits their professional credentials', async () => {
        await harness.resubmitCredentials("robert.green@example.com");
      });

      Then('"robert.green@example.com" validation status becomes invalid', () => {
        expect(harness.isProfileValidated("robert.green@example.com")).toBe(false);
      });

      And('"robert.green@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("robert.green@example.com")).toBe(false);
      });

      And('"robert.green@example.com" should be pending review', () => {
        expect(harness.isHelperPendingReview("robert.green@example.com")).toBe(true);
      });
    });

    Scenario("Validated helper resubmits background check", ({ Given, When, Then, And }) => {
      Given('helper "linda.blue@example.com" is validated', () => {
        harness.seedHelper({
          email: "linda.blue@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: true,
        });
      });

      And('"linda.blue@example.com" can apply to events', () => {
        expect(harness.canApplyToEvents("linda.blue@example.com")).toBe(true);
      });

      When('"linda.blue@example.com" resubmits their background screening', async () => {
        await harness.resubmitBackgroundCheck("linda.blue@example.com");
      });

      Then('"linda.blue@example.com" validation status becomes invalid', () => {
        expect(harness.isProfileValidated("linda.blue@example.com")).toBe(false);
      });

      And('"linda.blue@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("linda.blue@example.com")).toBe(false);
      });

      And('"linda.blue@example.com" should be pending review', () => {
        expect(harness.isHelperPendingReview("linda.blue@example.com")).toBe(true);
      });
    });

    Scenario("Pending review helper can resubmit credentials", ({ Given, When, Then, And }) => {
      Given('helper "charlie.brown@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "charlie.brown@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"charlie.brown@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("charlie.brown@example.com", { credentialsSubmitted: true });
      });

      And('"charlie.brown@example.com" has submitted their background screening', () => {
        harness.updateHelper("charlie.brown@example.com", { backgroundCheckSubmitted: true });
      });

      And('"charlie.brown@example.com" is pending review', () => {
        expect(harness.isHelperPendingReview("charlie.brown@example.com")).toBe(true);
      });

      When('"charlie.brown@example.com" resubmits their professional credentials', async () => {
        await harness.resubmitCredentials("charlie.brown@example.com");
      });

      Then("resubmission should succeed", () => {
        // If we reached here without throwing, resubmission succeeded
        expect(true).toBe(true);
      });

      And('"charlie.brown@example.com" should remain pending review', () => {
        expect(harness.isHelperPendingReview("charlie.brown@example.com")).toBe(true);
      });
    });

    Scenario("Pending review helper can resubmit background check", ({ Given, When, Then, And }) => {
      Given('helper "diana.prince@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "diana.prince@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"diana.prince@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("diana.prince@example.com", { credentialsSubmitted: true });
      });

      And('"diana.prince@example.com" has submitted their background screening', () => {
        harness.updateHelper("diana.prince@example.com", { backgroundCheckSubmitted: true });
      });

      And('"diana.prince@example.com" is pending review', () => {
        expect(harness.isHelperPendingReview("diana.prince@example.com")).toBe(true);
      });

      When('"diana.prince@example.com" resubmits their background screening', async () => {
        await harness.resubmitBackgroundCheck("diana.prince@example.com");
      });

      Then("resubmission should succeed", () => {
        // If we reached here without throwing, resubmission succeeded
        expect(true).toBe(true);
      });

      And('"diana.prince@example.com" should remain pending review', () => {
        expect(harness.isHelperPendingReview("diana.prince@example.com")).toBe(true);
      });
    });
  }
);

class ResubmitHelperDocumentsTestHarness {
  private constructor(
    private readonly helperRepository: InMemoryValidationHelperRepository,
    private readonly resubmitCredentialsUsecase: ResubmitCredentials,
    private readonly resubmitBackgroundCheckUsecase: ResubmitBackgroundCheck
  ) {}

  static setup() {
    const helperRepository = new InMemoryValidationHelperRepository();
    const resubmitCredentials = new ResubmitCredentials(helperRepository);
    const resubmitBackgroundCheck = new ResubmitBackgroundCheck(helperRepository);
    return new this(helperRepository, resubmitCredentials, resubmitBackgroundCheck);
  }

  seedHelper(helper: any) {
    this.helperRepository.add(helper);
  }

  updateHelper(email: string, updates: any) {
    this.helperRepository.update(email, updates);
  }

  async resubmitCredentials(email: string) {
    await this.resubmitCredentialsUsecase.execute(email);
  }

  async resubmitBackgroundCheck(email: string) {
    await this.resubmitBackgroundCheckUsecase.execute(email);
  }

  isProfileValidated(email: string): boolean {
    return this.helperRepository.isProfileValidated(email);
  }

  canApplyToEvents(email: string): boolean {
    return this.helperRepository.isProfileValidated(email);
  }

  isHelperPendingReview(email: string): boolean {
    const helper = this.helperRepository.findByEmail(email);
    if (!helper) return false;
    return (
      helper.emailConfirmed &&
      helper.credentialsSubmitted &&
      helper.backgroundCheckSubmitted &&
      !helper.profileValidated
    );
  }
}
