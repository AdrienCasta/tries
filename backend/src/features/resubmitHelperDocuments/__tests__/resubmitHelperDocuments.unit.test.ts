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

      And('"robert.green@example.com" should require admin attention', () => {
        expect(harness.doesHelperRequireAttention("robert.green@example.com")).toBe(true);
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

      And('"linda.blue@example.com" should require admin attention', () => {
        expect(harness.doesHelperRequireAttention("linda.blue@example.com")).toBe(true);
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

  doesHelperRequireAttention(email: string): boolean {
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
