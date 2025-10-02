import { loadFeature, describeFeature } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import { User } from "../domain/entities/User.js";
import { HelperRepository } from "../domain/repositories/HelperRepository.js";
import { OnboardHelper } from "../application/use-cases/OnboardHelper.js";
import { InMemoryHelperRepository } from "../infrastructure/repositories/InMemoryHelperRepository.js";
import { InMemoryOnboardingHelperNotificationService } from "../infrastructure/services/InMemoryOnboardingHelperNotificationService.js";

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feature = await loadFeature(path.resolve(__dirname, "../../../features/onboardHelper.feature"));

describeFeature(
  feature,
  ({
    BeforeAllScenarios,
    AfterAllScenarios,
    BeforeEachScenario,
    AfterEachScenario,
    ScenarioOutline,
  }) => {
    let helperRepository: HelperRepository;
    let onboardingHelperNotificationService: InMemoryOnboardingHelperNotificationService;
    let onboardHelper: OnboardHelper;

    BeforeAllScenarios(() => {
      helperRepository = new InMemoryHelperRepository();

      onboardingHelperNotificationService =
        new InMemoryOnboardingHelperNotificationService();

      onboardHelper = new OnboardHelper(
        helperRepository,
        onboardingHelperNotificationService
      );
    });
    AfterAllScenarios(() => {});
    BeforeEachScenario(() => {});
    AfterEachScenario(() => {});

    ScenarioOutline(
      `Successfully onboarding a new user as a helper`,
      ({ Given, When, Then, And }, { email, lastname, firstname }) => {
        Given(`the user's email is "<email>"`, () => {});
        And(`the user's first name is "<firstname>"`, () => {});
        And(`the user's last name is "<lastname>"`, () => {});
        When(`I onboard the user`, async () => {
          const user: User = {
            email,
            lastname,
            firstname,
          };

          await onboardHelper.execute(user);
        });
        Then(`the user should be onboarded as a helper`, async () => {
          const helper = await helperRepository.findByEmail(email);
          expect(helper).toBeDefined();
        });
        And(`the user should receive a notification`, async () => {
          expect(
            await onboardingHelperNotificationService.hasSentTo(email)
          ).toBe(true);
        });
      }
    );
  }
);
