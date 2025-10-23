import {
  describeFeature,
  loadFeatureFromText,
} from "@amiceli/vitest-cucumber";
// @ts-ignore
import featureContent from "../../../../../features/validateHelper.feature?raw";

import ValidateHelper from "../validateHelper.usecase";
import { InMemoryValidationHelperRepository } from "@infrastructure/persistence/InMemoryValidationHelperRepository";

const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario, Background }) => {
    let harness: ValidateHelperTestHarness;

    BeforeEachScenario(() => {
      harness = ValidateHelperTestHarness.setup();
    });

    Background(({ Given }) => {
      Given("I am authenticated as an admin", () => {});
    });

    Scenario("Validate helper to grant platform access", ({ Given, When, Then, And }) => {
      Given('helper "John Doe" has confirmed their email', () => {
        harness.seedHelper({
          firstname: "John",
          lastname: "Doe",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"John Doe" has submitted their professional credentials', () => {
        harness.updateHelper("John", "Doe", { credentialsSubmitted: true });
      });

      And('"John Doe" has submitted their background screening', () => {
        harness.updateHelper("John", "Doe", { backgroundCheckSubmitted: true });
      });

      When('I validate "John Doe"\'s profile', async () => {
        await harness.validateHelper("John", "Doe");
      });

      Then('"John Doe" should be able to access the platform', () => {
        expect(harness.isHelperValidated("John", "Doe")).toBe(true);
      });

      And('"John Doe" should no longer require my attention', () => {
        expect(harness.doesHelperRequireAttention("John", "Doe")).toBe(false);
      });
    });
  }
);

class ValidateHelperTestHarness {
  private constructor(
    private readonly helperRepository: InMemoryValidationHelperRepository,
    private readonly validateHelperUsecase: ValidateHelper
  ) {}

  static setup() {
    const helperRepository = new InMemoryValidationHelperRepository();
    const validateHelper = new ValidateHelper(helperRepository);
    return new this(helperRepository, validateHelper);
  }

  seedHelper(helper: any) {
    this.helperRepository.add(helper);
  }

  updateHelper(firstname: string, lastname: string, updates: any) {
    this.helperRepository.update(firstname, lastname, updates);
  }

  async validateHelper(firstname: string, lastname: string) {
    await this.validateHelperUsecase.execute(firstname, lastname);
  }

  isHelperValidated(firstname: string, lastname: string): boolean {
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
