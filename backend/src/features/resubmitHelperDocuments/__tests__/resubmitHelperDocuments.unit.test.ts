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
      Given('helper "Robert Green" is validated', () => {
        harness.seedHelper({
          firstname: "Robert",
          lastname: "Green",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: true,
        });
      });

      And('"Robert Green" can apply to events', () => {
        expect(harness.canApplyToEvents("Robert", "Green")).toBe(true);
      });

      When('"Robert Green" resubmits their professional credentials', async () => {
        await harness.resubmitCredentials("Robert", "Green");
      });

      Then('"Robert Green" validation status becomes invalid', () => {
        expect(harness.isProfileValidated("Robert", "Green")).toBe(false);
      });

      And('"Robert Green" cannot apply to events', () => {
        expect(harness.canApplyToEvents("Robert", "Green")).toBe(false);
      });

      And('"Robert Green" should require admin attention', () => {
        expect(harness.doesHelperRequireAttention("Robert", "Green")).toBe(true);
      });
    });

    Scenario("Validated helper resubmits background check", ({ Given, When, Then, And }) => {
      Given('helper "Linda Blue" is validated', () => {
        harness.seedHelper({
          firstname: "Linda",
          lastname: "Blue",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: true,
        });
      });

      And('"Linda Blue" can apply to events', () => {
        expect(harness.canApplyToEvents("Linda", "Blue")).toBe(true);
      });

      When('"Linda Blue" resubmits their background screening', async () => {
        await harness.resubmitBackgroundCheck("Linda", "Blue");
      });

      Then('"Linda Blue" validation status becomes invalid', () => {
        expect(harness.isProfileValidated("Linda", "Blue")).toBe(false);
      });

      And('"Linda Blue" cannot apply to events', () => {
        expect(harness.canApplyToEvents("Linda", "Blue")).toBe(false);
      });

      And('"Linda Blue" should require admin attention', () => {
        expect(harness.doesHelperRequireAttention("Linda", "Blue")).toBe(true);
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

  async resubmitCredentials(firstname: string, lastname: string) {
    await this.resubmitCredentialsUsecase.execute(firstname, lastname);
  }

  async resubmitBackgroundCheck(firstname: string, lastname: string) {
    await this.resubmitBackgroundCheckUsecase.execute(firstname, lastname);
  }

  isProfileValidated(firstname: string, lastname: string): boolean {
    return this.helperRepository.isProfileValidated(firstname, lastname);
  }

  canApplyToEvents(firstname: string, lastname: string): boolean {
    return this.helperRepository.isProfileValidated(firstname, lastname);
  }

  doesHelperRequireAttention(firstname: string, lastname: string): boolean {
    const helper = this.helperRepository.findByName(firstname, lastname);
    if (!helper) return false;
    return (
      helper.emailConfirmed &&
      helper.credentialsSubmitted &&
      helper.backgroundCheckSubmitted &&
      !helper.profileValidated
    );
  }
}
