import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";

import RegisterHelper from "@features/registerHelper/registerHelper.usecase";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";
import { FixedClock } from "@infrastructure/time/FixedClock";
import RegisterHelperCommandFixture from "@features/registerHelper/__tests__/fixtures/RegisterHelperCommandFixture";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService";
import { Result } from "@shared/infrastructure/Result";
import { InMemoryHelperRepository } from "@infrastructure/persistence/InMemoryHelperRepository";
import { Helper } from "@shared/domain/entities/Helper";
import { ConfirmHelperEmail } from "../ConfirmHelperEmail.usecase";

// @ts-ignore
import featureContent from "../../../../../features/confirmEmail.feature?raw";
const feature = await loadFeatureFromText(featureContent);

const VALID_CONFIRMATION_TOKEN = "valid-token-12345";

class FakeEmailConfirmationService implements EmailConfirmationService {
  constructor(private authUserRepository: InMemoryAuthUserRepository) {}

  async confirmEmail(token: string) {
    return Result.ok();
  }

  async confirmEmailForUser(email: string) {
    const user = await this.authUserRepository.getUserByEmail(email);
    if (user) {
      this.authUserRepository.authUsers.set(email, {
        ...user,
        emailConfirmed: true,
      });
    }
  }
}

class TestHarness {
  helperRepository: InMemoryHelperRepository;
  authUserRepository: InMemoryAuthUserRepository;
  emailConfirmationService: FakeEmailConfirmationService;
  clock: FixedClock;
  registerHelper: RegisterHelper;
  confirmHelperEmail: ConfirmHelperEmail;

  constructor() {
    this.helperRepository = new InMemoryHelperRepository();
    this.authUserRepository = new InMemoryAuthUserRepository();
    this.emailConfirmationService = new FakeEmailConfirmationService(
      this.authUserRepository
    );
    this.clock = new FixedClock();
    this.registerHelper = new RegisterHelper(
      this.authUserRepository,
      this.clock
    );
    this.confirmHelperEmail = new ConfirmHelperEmail(
      this.emailConfirmationService,
      this.authUserRepository,
      this.helperRepository
    );
  }

  async registerHelperWith(command: any) {
    await this.registerHelper.execute(command);
  }

  async confirmEmail(email: string) {
    await this.emailConfirmationService.confirmEmailForUser(email);
    return await this.confirmHelperEmail.execute({
      email,
      token: VALID_CONFIRMATION_TOKEN,
    });
  }

  isEmailConfirmed(email: string): boolean {
    console.log(this.authUserRepository.authUsers.get(email));
    return (
      this.authUserRepository.authUsers.get(email)?.emailConfirmed ?? false
    );
  }

  async getHelper(email: string): Promise<Helper | null> {
    return await this.helperRepository.findByEmail(email);
  }
}

describeFeature(feature, ({ BeforeEachScenario, Scenario, Background }) => {
  let harness = new TestHarness();
  BeforeEachScenario(() => {
    harness = new TestHarness();
  });
  Background(({ Given }) => {
    Given("I am a helper who registered on the platform", () => {});
  });

  Scenario.only(
    "Successfully confirm email with valid token",
    ({ Given, When, Then, And }) => {
      const command = RegisterHelperCommandFixture.aValidCommand();

      Given(
        "I registered information including criminal record and diploma",
        async () => {
          await harness.registerHelperWith(command);
        }
      );
      And("I have never confirm my email before", () => {
        expect(harness.isEmailConfirmed(command.email)).toBe(false);
      });
      When("I confirm my email", async () => {
        await harness.confirmEmail(command.email);
      });
      Then("I have been granted limited access", async () => {
        expect(harness.isEmailConfirmed(command.email)).toBe(true);
      });
      And("I cannot apply to events", () => {});
      And("I should be pending review", async () => {
        const helper = await harness.getHelper(command.email);
        expect(helper?.isPendingReview()).toBe(true);
      });
    }
  );

  Scenario(
    "Successfully confirm email without providing credential",
    ({ Given, When, Then, And }) => {
      const command = RegisterHelperCommandFixture.aValidCommand({
        professions: [
          {
            code: "physiotherapist",
            healthId: { rpps: "12345678901" },
          },
        ],
      });

      Given("I registered information", async () => {
        await harness.registerHelperWith(command);
      });
      When("I confirm my email", async () => {
        await harness.confirmEmail(command.email);
      });
      Then("I have been granted limited access", () => {});
      And("my profile should be incomplete", async () => {
        const helper = await harness.getHelper(command.email);
        expect(helper?.isIncomplete()).toBe(true);
      });
    }
  );

  Scenario(
    "Successfully confirm email without providing criminal record",
    ({ Given, When, Then, And }) => {
      const command = RegisterHelperCommandFixture.aValidCommand();
      command.criminalRecordCertificate = undefined;

      Given("I registered information", async () => {
        await harness.registerHelperWith(command);
      });
      When("I confirm my email", async () => {
        await harness.confirmEmail(command.email);
      });
      Then("I have been granted limited access", () => {});
      And("my profile should be incomplete", async () => {
        const helper = await harness.getHelper(command.email);
        expect(helper?.isIncomplete()).toBe(true);
      });
    }
  );

  Scenario(
    "Cannot confirm email when account does not exist",
    ({ Given, When, Then, And }) => {
      const nonExistentEmail = "nonexistent@example.com";
      let confirmResult: any;

      Given("I never registered on the platform", () => {});
      When("I confirm my email", async () => {
        confirmResult = await harness.confirmEmail(nonExistentEmail);
      });
      Then('I should see "Account not found" error', () => {
        expect(Result.isFailure(confirmResult)).toBe(true);
        expect((confirmResult as any).error.message).toContain(
          "Account not found"
        );
      });
      And("my email should not be confirmed", () => {
        expect(harness.isEmailConfirmed(nonExistentEmail)).toBe(false);
      });
    }
  );

  Scenario(
    "Cannot confirm email when system fails to save",
    ({ Given, When, Then, And }) => {
      const command = RegisterHelperCommandFixture.aValidCommand();
      let confirmResult: any;

      Given("I registered information", async () => {
        await harness.registerHelperWith(command);
      });
      And("the system encounters an error while saving", () => {
        harness.helperRepository.simulateFailure();
      });
      When("I confirm my email", async () => {
        confirmResult = await harness.confirmEmail(command.email);
      });
      Then('I should see "System error" message', () => {
        expect(Result.isFailure(confirmResult)).toBe(true);
        expect((confirmResult as any).error.message).toContain(
          "Failed to save helper profile"
        );
      });
      And("my email should not be confirmed", () => {
        expect(harness.isEmailConfirmed(command.email)).toBe(false);
      });
    }
  );
});
