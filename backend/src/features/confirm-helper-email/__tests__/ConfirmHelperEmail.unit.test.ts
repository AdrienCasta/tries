import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";

// @ts-ignore
import featureContent from "../../../../../features/confirmEmail.feature?raw";
import RegisterHelper from "@features/registerHelper/registerHelper.usecase";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";
import { FixedClock } from "@infrastructure/time/FixedClock";
import RegisterHelperCommandFixture from "@features/registerHelper/__tests__/fixtures/RegisterHelperCommandFixture";
import { EmailConfirmationService } from "@shared/domain/services/EmailConfirmationService";
import { Result, Success } from "@shared/infrastructure/Result";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository";
import { InMemoryHelperRepository } from "@infrastructure/persistence/InMemoryHelperRepository";
import { HelperRepository } from "@shared/domain/repositories/HelperRepository";
import { Helper } from "@shared/domain/entities/Helper";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import Lastname from "@shared/domain/value-objects/Lastname";
import Firstname from "@shared/domain/value-objects/Firstname";
import Birthdate from "@shared/domain/value-objects/Birthdate";
import Profession, {
  ProfessionWithHealthId,
} from "@shared/domain/value-objects/Profession";
import Residence from "@shared/domain/value-objects/Residence";
import HelperId from "@shared/domain/value-objects/HelperId";
import PlaceOfBirth from "@shared/domain/value-objects/PlaceOfBirth";
const feature = await loadFeatureFromText(featureContent);

const VALID_CONFIRMATION_TOKEN = "valid-token-12345";

class FakeEmailConfirmationService implements EmailConfirmationService {
  async confirmEmail(token: string) {
    return Result.ok();
  }
}

class TestHarness {
  helperRepository: InMemoryHelperRepository;
  authUserRepository: InMemoryAuthUserRepository;
  clock: FixedClock;
  registerHelper: RegisterHelper;
  confirmHelperEmail: ConfirmHelperEmail;

  constructor() {
    this.helperRepository = new InMemoryHelperRepository();
    this.authUserRepository = new InMemoryAuthUserRepository();
    this.clock = new FixedClock();
    this.registerHelper = new RegisterHelper(
      this.authUserRepository,
      this.clock
    );
    this.confirmHelperEmail = new ConfirmHelperEmail(
      new FakeEmailConfirmationService(),
      this.authUserRepository,
      this.helperRepository
    );
  }

  async registerHelperWith(command: any) {
    await this.registerHelper.execute(command);
  }

  async confirmEmail(email: string) {
    return await this.confirmHelperEmail.execute(
      email,
      VALID_CONFIRMATION_TOKEN
    );
  }

  isEmailConfirmed(email: string): boolean {
    return (
      this.authUserRepository.authUsers.get(email)?.emailConfirmed ?? false
    );
  }

  async getHelper(email: string): Promise<Helper | null> {
    return await this.helperRepository.findByEmail(email);
  }
}

class ConfirmHelperEmail {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly authUserRepository: AuthUserRepository,
    private readonly helperRepository: HelperRepository
  ) {}

  async execute(email: string, token: string): Promise<Result<void, Error>> {
    const authUser = await this.authUserRepository.getUserByEmail(email);

    if (!authUser) {
      return Result.fail(new Error("Account not found"));
    }

    const isIncomplete =
      authUser.professions.some((p) => !p.credentialId) ||
      !authUser.criminalRecordCertificateId;

    const helperDataResult = this.buildHelperData(authUser);
    if (Result.isFailure(helperDataResult)) {
      console.error("Failed to build helper data from repository:", helperDataResult.error);
      return Result.fail(new Error("System error - unable to process account data"));
    }

    const helper = isIncomplete
      ? Helper.asIncomplete(helperDataResult.value)
      : Helper.inPendingReview(helperDataResult.value);

    const saveResult = await this.helperRepository.save(helper);

    if (Result.isFailure(saveResult)) {
      return Result.fail(saveResult.error);
    }

    await this.authUserRepository.confirmEmail(email);

    return Result.ok(undefined);
  }

  private buildHelperData(authUser: any): Result<any, Error> {
    return Result.combineObject({
      id: Result.ok(HelperId.create(authUser.id)),
      email: HelperEmail.create(authUser.email),
      lastname: Lastname.create(authUser.lastname),
      firstname: Firstname.create(authUser.firstname),
      birthdate: Birthdate.create(new Date(authUser.birthdate)),
      residence:
        authUser.residence.country === "FR"
          ? Residence.createFrenchResidence(
              authUser.residence.frenchAreaCode as string
            )
          : Residence.createForeignResidence(authUser.residence.country),
      placeOfBirth: PlaceOfBirth.create(authUser.placeOfBirth),
      professions: Profession.createMany(
        authUser.professions.map((p) => p as ProfessionWithHealthId)
      ),
    });
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

  Scenario(
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

// describe("Cannot confirm email when repository fails to fetch user", () => {});
