import {
  describeFeature,
  loadFeatureFromText,
} from "@amiceli/vitest-cucumber";
// @ts-ignore
import featureContent from "../../../../../features/validateHelper.feature?raw";
import { Result } from "@shared/infrastructure/Result";

import ValidateHelper from "../validateHelper.usecase";
import { InMemoryValidationHelperRepository } from "@infrastructure/persistence/InMemoryValidationHelperRepository";

const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario, ScenarioOutline, Background }) => {
    let harness: ValidateHelperTestHarness;

    BeforeEachScenario(() => {
      harness = ValidateHelperTestHarness.setup();
    });

    Background(({ Given }) => {
      Given("I am authenticated as an admin", () => {});
    });

    Scenario("Validate helper to enable event applications", ({ Given, When, Then, And }) => {
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

      Then('"John Doe" can apply to events', () => {
        expect(harness.canApplyToEvents("John", "Doe")).toBe(true);
      });

      And('"John Doe" should no longer require my attention', () => {
        expect(harness.doesHelperRequireAttention("John", "Doe")).toBe(false);
      });
    });

    ScenarioOutline(
      "Cannot validate helper with incomplete requirements",
      ({ Given, When, Then, And }, { credentialsSubmitted, backgroundCheckSubmitted, error }) => {
        Given('helper "Bob Martin" has confirmed their email', () => {
          harness.seedHelper({
            firstname: "Bob",
            lastname: "Martin",
            emailConfirmed: true,
            credentialsSubmitted: credentialsSubmitted === "true",
            backgroundCheckSubmitted: backgroundCheckSubmitted === "true",
            profileValidated: false,
          });
        });

        And('"Bob Martin" credentials submission status is <credentialsSubmitted>', () => {});

        And('"Bob Martin" background check submission status is <backgroundCheckSubmitted>', () => {});

        When('I attempt to validate "Bob Martin"', async () => {
          await harness.attemptValidateHelper("Bob", "Martin");
        });

        Then('validation should fail with error "<error>"', () => {
          expect(harness.getLastValidationError()).toBe(error);
        });

        And('"Bob Martin" cannot apply to events', () => {
          expect(harness.canApplyToEvents("Bob", "Martin")).toBe(false);
        });
      }
    );

    Scenario("Cannot validate already validated helper", ({ Given, When, Then, And }) => {
      Given('helper "John Doe" is already validated', () => {
        harness.seedHelper({
          firstname: "John",
          lastname: "Doe",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: true,
        });
      });

      When('I attempt to validate "John Doe"', async () => {
        await harness.attemptValidateHelper("John", "Doe");
      });

      Then('validation should fail with error "Helper is already validated"', () => {
        expect(harness.getLastValidationError()).toBe("Helper is already validated");
      });

      And('"John Doe" can still apply to events', () => {
        expect(harness.canApplyToEvents("John", "Doe")).toBe(true);
      });
    });
  }
);

class ValidateHelperTestHarness {
  private lastValidationError: string | null = null;

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
    const result = await this.validateHelperUsecase.execute(firstname, lastname);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async attemptValidateHelper(firstname: string, lastname: string) {
    const result = await this.validateHelperUsecase.execute(firstname, lastname);
    if (Result.isFailure(result)) {
      this.lastValidationError = result.error.message;
    } else {
      this.lastValidationError = null;
    }
  }

  getLastValidationError(): string | null {
    return this.lastValidationError;
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
