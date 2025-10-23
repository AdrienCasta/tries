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
      Given('helper "john.doe@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "john.doe@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"john.doe@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("john.doe@example.com", { credentialsSubmitted: true });
      });

      And('"john.doe@example.com" has submitted their background screening', () => {
        harness.updateHelper("john.doe@example.com", { backgroundCheckSubmitted: true });
      });

      When('I validate "john.doe@example.com"', async () => {
        await harness.validateHelper("john.doe@example.com");
      });

      Then('"john.doe@example.com" can apply to events', () => {
        expect(harness.canApplyToEvents("john.doe@example.com")).toBe(true);
      });

      And('"john.doe@example.com" should no longer require my attention', () => {
        expect(harness.doesHelperRequireAttention("john.doe@example.com")).toBe(false);
      });
    });

    ScenarioOutline(
      "Cannot validate helper with incomplete requirements",
      ({ Given, When, Then, And }, { credentialsSubmitted, backgroundCheckSubmitted, error }) => {
        Given('helper "bob.martin@example.com" has confirmed their email', () => {
          harness.seedHelper({
            email: "bob.martin@example.com",
            emailConfirmed: true,
            credentialsSubmitted: credentialsSubmitted === "true",
            backgroundCheckSubmitted: backgroundCheckSubmitted === "true",
            profileValidated: false,
          });
        });

        And('"bob.martin@example.com" credentials submission status is <credentialsSubmitted>', () => {});

        And('"bob.martin@example.com" background check submission status is <backgroundCheckSubmitted>', () => {});

        When('I attempt to validate "bob.martin@example.com"', async () => {
          await harness.attemptValidateHelper("bob.martin@example.com");
        });

        Then('validation should fail with error "<error>"', () => {
          expect(harness.getLastValidationError()).toBe(error);
        });

        And('"bob.martin@example.com" cannot apply to events', () => {
          expect(harness.canApplyToEvents("bob.martin@example.com")).toBe(false);
        });
      }
    );

    Scenario("Cannot validate already validated helper", ({ Given, When, Then, And }) => {
      Given('helper "john.doe@example.com" is already validated', () => {
        harness.seedHelper({
          email: "john.doe@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: true,
        });
      });

      When('I attempt to validate "john.doe@example.com"', async () => {
        await harness.attemptValidateHelper("john.doe@example.com");
      });

      Then('validation should fail with error "Helper is already validated"', () => {
        expect(harness.getLastValidationError()).toBe("Helper is already validated");
      });

      And('"john.doe@example.com" can still apply to events', () => {
        expect(harness.canApplyToEvents("john.doe@example.com")).toBe(true);
      });
    });

    Scenario("Cannot validate rejected helper", ({ Given, When, Then, And }) => {
      Given('helper "sarah.connor@example.com" has been rejected', () => {
        harness.seedHelper({
          email: "sarah.connor@example.com",
          emailConfirmed: true,
          credentialsSubmitted: true,
          backgroundCheckSubmitted: true,
          profileValidated: false,
          rejected: true,
        });
      });

      When('I attempt to validate "sarah.connor@example.com"', async () => {
        await harness.attemptValidateHelper("sarah.connor@example.com");
      });

      Then('validation should fail with error "Cannot validate rejected helper"', () => {
        expect(harness.getLastValidationError()).toBe("Cannot validate rejected helper");
      });

      And('"sarah.connor@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("sarah.connor@example.com")).toBe(false);
      });
    });

    Scenario("Notify helper when validated", ({ Given, When, Then, And }) => {
      Given('helper "alice.brown@example.com" has confirmed their email', () => {
        harness.seedHelper({
          email: "alice.brown@example.com",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"alice.brown@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("alice.brown@example.com", { credentialsSubmitted: true });
      });

      And('"alice.brown@example.com" has submitted their background screening', () => {
        harness.updateHelper("alice.brown@example.com", { backgroundCheckSubmitted: true });
      });

      When('I validate "alice.brown@example.com"', async () => {
        await harness.validateHelper("alice.brown@example.com");
      });

      Then('"alice.brown@example.com" should receive a validation notification', () => {
        expect(harness.wasValidationNotificationSent("alice.brown@example.com")).toBe(true);
      });
    });

    Scenario("Cannot validate helper with unconfirmed email", ({ Given, When, Then, And }) => {
      Given('helper "charlie.davis@example.com" has not confirmed their email', () => {
        harness.seedHelper({
          email: "charlie.davis@example.com",
          emailConfirmed: false,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"charlie.davis@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("charlie.davis@example.com", { credentialsSubmitted: true });
      });

      And('"charlie.davis@example.com" has submitted their background screening', () => {
        harness.updateHelper("charlie.davis@example.com", { backgroundCheckSubmitted: true });
      });

      When('I attempt to validate "charlie.davis@example.com"', async () => {
        await harness.attemptValidateHelper("charlie.davis@example.com");
      });

      Then('validation should fail with error "Cannot validate helper with unconfirmed email"', () => {
        expect(harness.getLastValidationError()).toBe("Cannot validate helper with unconfirmed email");
      });

      And('"charlie.davis@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("charlie.davis@example.com")).toBe(false);
      });
    });

    Scenario("Multiple helpers with same name can be validated independently", ({ Given, When, Then, And }) => {
      Given('helper "john.smith.1@example.com" named "John Smith" has confirmed their email', () => {
        harness.seedHelper({
          email: "john.smith.1@example.com",
          firstname: "John",
          lastname: "Smith",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"john.smith.1@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("john.smith.1@example.com", { credentialsSubmitted: true });
      });

      And('"john.smith.1@example.com" has submitted their background screening', () => {
        harness.updateHelper("john.smith.1@example.com", { backgroundCheckSubmitted: true });
      });

      And('helper "john.smith.2@example.com" named "John Smith" has confirmed their email', () => {
        harness.seedHelper({
          email: "john.smith.2@example.com",
          firstname: "John",
          lastname: "Smith",
          emailConfirmed: true,
          credentialsSubmitted: false,
          backgroundCheckSubmitted: false,
          profileValidated: false,
        });
      });

      And('"john.smith.2@example.com" has submitted their professional credentials', () => {
        harness.updateHelper("john.smith.2@example.com", { credentialsSubmitted: true });
      });

      And('"john.smith.2@example.com" has submitted their background screening', () => {
        harness.updateHelper("john.smith.2@example.com", { backgroundCheckSubmitted: true });
      });

      When('I validate "john.smith.1@example.com"', async () => {
        await harness.validateHelper("john.smith.1@example.com");
      });

      Then('"john.smith.1@example.com" can apply to events', () => {
        expect(harness.canApplyToEvents("john.smith.1@example.com")).toBe(true);
      });

      And('"john.smith.2@example.com" cannot apply to events', () => {
        expect(harness.canApplyToEvents("john.smith.2@example.com")).toBe(false);
      });
    });
  }
);

class InMemoryHelperNotificationService {
  private validationNotifications: Set<string> = new Set();

  notifyValidated(email: string): void {
    this.validationNotifications.add(email);
  }

  wasNotified(email: string): boolean {
    return this.validationNotifications.has(email);
  }
}

class ValidateHelperTestHarness {
  private lastValidationError: string | null = null;

  private constructor(
    private readonly helperRepository: InMemoryValidationHelperRepository,
    private readonly notificationService: InMemoryHelperNotificationService,
    private readonly validateHelperUsecase: ValidateHelper
  ) {}

  static setup() {
    const helperRepository = new InMemoryValidationHelperRepository();
    const notificationService = new InMemoryHelperNotificationService();
    const validateHelper = new ValidateHelper(helperRepository, notificationService);
    return new this(helperRepository, notificationService, validateHelper);
  }

  seedHelper(helper: any) {
    this.helperRepository.add(helper);
  }

  updateHelper(email: string, updates: any) {
    this.helperRepository.update(email, updates);
  }

  async validateHelper(email: string) {
    const result = await this.validateHelperUsecase.execute(email);
    if (Result.isFailure(result)) {
      throw result.error;
    }
  }

  async attemptValidateHelper(email: string) {
    const result = await this.validateHelperUsecase.execute(email);
    if (Result.isFailure(result)) {
      this.lastValidationError = result.error.message;
    } else {
      this.lastValidationError = null;
    }
  }

  getLastValidationError(): string | null {
    return this.lastValidationError;
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

  wasValidationNotificationSent(email: string): boolean {
    return this.notificationService.wasNotified(email);
  }
}
