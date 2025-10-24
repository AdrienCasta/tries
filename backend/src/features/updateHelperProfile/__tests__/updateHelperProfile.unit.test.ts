import {
  describeFeature,
  loadFeatureFromText,
} from "@amiceli/vitest-cucumber";
import featureContent from "../../../../../features/updateHelperProfile.feature?raw";

import UpdateHelperProfile from "../UpdateHelperProfile.usecase";
import InvalidateHelperValidation from "@features/invalidateHelperValidation/InvalidateHelperValidation.usecase";
import { InMemoryValidationHelperRepository } from "@infrastructure/persistence/InMemoryValidationHelperRepository";
import InMemoryEventBus from "@infrastructure/events/InMemoryEventBus";
import { SystemClock } from "@infrastructure/time/SystemClock";

const feature = await loadFeatureFromText(featureContent);

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario }) => {
    let harness: UpdateHelperProfileTestHarness;

    BeforeEachScenario(() => {
      harness = UpdateHelperProfileTestHarness.setup();
    });

    Scenario("Validated helper updates credentials", ({ Given, When, Then, And }) => {
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

      When('"robert.green@example.com" updates their professional credentials', async () => {
        await harness.updateCredentials("robert.green@example.com");
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

    Scenario("Validated helper updates background check", ({ Given, When, Then, And }) => {
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

      When('"linda.blue@example.com" updates their background screening', async () => {
        await harness.updateBackgroundCheck("linda.blue@example.com");
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

    Scenario("Pending review helper can update credentials", ({ Given, When, Then, And }) => {
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

      When('"charlie.brown@example.com" updates their professional credentials', async () => {
        await harness.updateCredentials("charlie.brown@example.com");
      });

      Then("update should succeed", () => {
        expect(true).toBe(true);
      });

      And('"charlie.brown@example.com" should remain pending review', () => {
        expect(harness.isHelperPendingReview("charlie.brown@example.com")).toBe(true);
      });
    });

    Scenario("Pending review helper can update background check", ({ Given, When, Then, And }) => {
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

      When('"diana.prince@example.com" updates their background screening', async () => {
        await harness.updateBackgroundCheck("diana.prince@example.com");
      });

      Then("update should succeed", () => {
        expect(true).toBe(true);
      });

      And('"diana.prince@example.com" should remain pending review', () => {
        expect(harness.isHelperPendingReview("diana.prince@example.com")).toBe(true);
      });
    });
  }
);

class UpdateHelperProfileTestHarness {
  private constructor(
    private readonly helperRepository: InMemoryValidationHelperRepository,
    private readonly updateHelperProfileUsecase: UpdateHelperProfile,
    private readonly eventBus: InMemoryEventBus
  ) {}

  static setup() {
    const helperRepository = new InMemoryValidationHelperRepository();
    const eventBus = new InMemoryEventBus();
    const clock = new SystemClock();

    const invalidateHelperValidation = new InvalidateHelperValidation(helperRepository);

    const updateHelperProfile = new UpdateHelperProfile(
      helperRepository,
      eventBus,
      clock,
      invalidateHelperValidation
    );

    return new this(helperRepository, updateHelperProfile, eventBus);
  }

  seedHelper(helper: any) {
    this.helperRepository.add(helper);
  }

  updateHelper(email: string, updates: any) {
    this.helperRepository.update(email, updates);
  }

  async updateCredentials(email: string) {
    await this.updateHelperProfileUsecase.execute(email, { credentialsSubmitted: true });
  }

  async updateBackgroundCheck(email: string) {
    await this.updateHelperProfileUsecase.execute(email, { backgroundCheckSubmitted: true });
  }

  isProfileValidated(email: string): boolean {
    const helper = this.helperRepository.findByEmail(email);
    return helper?.profileValidated ?? false;
  }

  canApplyToEvents(email: string): boolean {
    const helper = this.helperRepository.findByEmail(email);
    return helper?.profileValidated ?? false;
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
