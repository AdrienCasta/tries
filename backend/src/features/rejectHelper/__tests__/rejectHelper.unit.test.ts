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
  }
);

class RejectHelperTestHarness {
  private lastRejectionError: string | null = null;

  private constructor(
    private readonly helperRepository: InMemoryValidationHelperRepository,
    private readonly rejectHelperUsecase: RejectHelper
  ) {}

  static setup() {
    const helperRepository = new InMemoryValidationHelperRepository();
    const rejectHelper = new RejectHelper(helperRepository);
    return new this(helperRepository, rejectHelper);
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
}
