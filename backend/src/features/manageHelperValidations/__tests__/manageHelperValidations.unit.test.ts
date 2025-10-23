import {
  describeFeature,
  loadFeatureFromText,
} from "@amiceli/vitest-cucumber";
// @ts-ignore
import featureContent from "../../../../../features/manageHelperValidations.feature?raw";

import ManageHelperValidations from "../manageHelperValidations.usecase";
import { InMemoryValidationHelperRepository } from "@infrastructure/persistence/InMemoryValidationHelperRepository";

const feature = await loadFeatureFromText(featureContent);

type HelperForValidation = {
  firstname: string;
  lastname: string;
  emailConfirmed: boolean;
  credentialsSubmitted: boolean;
  backgroundCheckSubmitted: boolean;
  profileValidated: boolean;
};

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario, Background }) => {
    let harness: ManageHelperValidationsTestHarness;

    BeforeEachScenario(() => {
      harness = ManageHelperValidationsTestHarness.setup();
    });

    Background(({ Given }) => {
      Given("I am authenticated as an admin", () => {});
    });

    Scenario("Identify helpers requiring my attention", ({ Given, When, Then, And, But }) => {
      Given("the following helpers exist:", () => {
        const helpers = [
          {
            firstname: "John",
            lastname: "Doe",
            emailConfirmed: true,
            credentialsSubmitted: true,
            backgroundCheckSubmitted: true,
            profileValidated: false,
          },
          {
            firstname: "Jane",
            lastname: "Smith",
            emailConfirmed: true,
            credentialsSubmitted: true,
            backgroundCheckSubmitted: true,
            profileValidated: false,
          },
          {
            firstname: "Bob",
            lastname: "Martin",
            emailConfirmed: false,
            credentialsSubmitted: false,
            backgroundCheckSubmitted: false,
            profileValidated: false,
          },
          {
            firstname: "Alice",
            lastname: "Wilson",
            emailConfirmed: true,
            credentialsSubmitted: true,
            backgroundCheckSubmitted: true,
            profileValidated: true,
          },
        ];
        harness.seedHelpers(helpers);
      });

      When("I view helpers requiring validation", async () => {
        await harness.getHelpersRequiringValidation();
      });

      Then("I should see 2 helpers needing my attention", () => {
        expect(harness.getHelpersCount()).toBe(2);
      });

      And('I should see "John Doe" marked as "ready for validation"', () => {});

      And('I should see "Jane Smith" marked as "ready for validation"', () => {});

      But('I should not see "Bob Martin"', () => {});

      And('I should not see "Alice Wilson"', () => {});
    });
  }
);

class ManageHelperValidationsTestHarness {
  private result: HelperForValidation[] = [];

  private constructor(
    private readonly helperRepository: InMemoryValidationHelperRepository,
    private readonly manageHelperValidationsUsecase: ManageHelperValidations
  ) {}

  static setup() {
    const helperRepository = new InMemoryValidationHelperRepository();
    const manageHelperValidations = new ManageHelperValidations(
      helperRepository
    );
    return new this(helperRepository, manageHelperValidations);
  }

  seedHelpers(helpers: HelperForValidation[]) {
    helpers.forEach((helper) => {
      this.helperRepository.add(helper);
    });
  }

  async getHelpersRequiringValidation() {
    this.result = await this.manageHelperValidationsUsecase.execute();
  }

  getHelpersCount(): number {
    return this.result.length;
  }
}
