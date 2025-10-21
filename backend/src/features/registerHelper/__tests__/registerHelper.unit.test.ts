import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
// @ts-ignore
import featureContent from "../../../../../features/registerHelper.feature?raw";
import { Failure, Result } from "@shared/infrastructure/Result";
import HelperEmail from "@shared/domain/value-objects/HelperEmail";
import InvalidEmailError from "@shared/infrastructure/InvalidEmailError";
import Firstname from "@shared/domain/value-objects/Firstname";
import Lastname from "@shared/domain/value-objects/Lastname";
import { EmailFixtures } from "@shared/__tests__/fixtures/EmailFixtures";
import DomainError from "@shared/domain/DomainError";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "Email is required": "InvalidEmailError",
  "Invalid email format": "InvalidEmailError",
  "First name too short": "FirstnameTooShortError",
  "Last name too short": "LastnameTooShortError",
  // "birthdate provided is set to the future.": "BIRTHDATE_IN_FUTUR",
  // "age requirement not met. You must be at least 16 yo.": "TOO_YOUNG_TO_WORK",
  // "Phone number invalid": "PHONE_NUMBER_INVALID",
  // "Profession invalid": "UNKNOWN_PROFESSION",
  // "this email address is already in use.": "EMAIL_ALREADY_IN_USE",
  // "Invalid french county": "RESIDENCE_INVALID",
  // "Invalid residence": "RESIDENCE_INVALID",
  // "this phone number is already in use.": "PHONE_NUMBER_ALREADY_IN_USE",
  // "Rpps must be 11 digits long": "RPPS_INVALID",
  // "Adeli must be 9 digits long": "ADELI_INVALID",
  // "Profession requires different health id type": "WRONG_HEALTH_ID_TYPE",
};
setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});
class RegisterHelperCommandFixture {
  static aValidCommand(
    overrides?: Partial<RegisterHelperCommand>
  ): RegisterHelperCommand {
    return {
      email: overrides?.email ?? EmailFixtures.aRandomEmail(),
      firstname: overrides?.firstname ?? "John",
      lastname: overrides?.lastname ?? "Doe",
    };
  }
}
describeFeature(
  feature,
  ({ BeforeEachScenario, ScenarioOutline, Scenario, Background }) => {
    let harness: RegisterHelperUnitTestHarness;

    BeforeEachScenario(() => {
      harness = RegisterHelperUnitTestHarness.setup();
    });

    Background(({ Given }) => {
      Given(
        "I am healthcare professional wishing to become an helper",
        () => {}
      );
    });

    Scenario("Helper register successfully", ({ When, Then, And }) => {
      const command = RegisterHelperCommandFixture.aValidCommand();

      When("I submit my information", () => {
        harness.registerHelper(command);
      });
      Then("I am notified it went well", async () => {
        expect(harness.didHelperRegisterSuccessfully()).toBe(true);
      });
      And("notified I have to confirm my email", () => {
        expect(harness.didHelperConfirmedEmailYet(command.email)).toBe(false);
      });
    });

    ScenarioOutline(
      "Helper fail to register with invalid email",
      ({ When, Then, And }, { email, error }) => {
        const command = RegisterHelperCommandFixture.aValidCommand({ email });

        When("I submit my information with an invalid email <email>", () => {
          harness.registerHelper(command);
        });
        Then("I am notified it went wrong because of <error>", () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });
        And("notified I have to change my email", () => {
          harness.expectRegistrationFailedWithError(error);
        });
      }
    );

    ScenarioOutline(
      "Fail to register with invalid name",
      ({ When, Then, And }, { firstname, lastname, error }) => {
        const command = RegisterHelperCommandFixture.aValidCommand({
          firstname,
          lastname,
        });
        When(
          "I submit my information with an invalid name <firstname> <lastname>",
          () => {
            harness.registerHelper(command);
          }
        );
        Then("I am notified it went wrong because <error>", async () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });
        And("notified I have to change my name information", async () => {
          harness.expectRegistrationFailedWithError(error);
        });
      }
    );
  }
);

type RegisterHelperCommand = {
  firstname: string;
  lastname: string;
  email: string;
};

interface AuthUserRead {
  firstname: string;
  lastname: string;
  email: string;
  emailConfirmed: boolean;
}
interface AuthUserWrite {
  firstname: string;
  lastname: string;
  email: string;
}

interface AuthUserRepository {
  createUser(authUser: AuthUserWrite): Promise<void>;
}

class InMemoryAuthUserRepository implements AuthUserRepository {
  authUsers: Map<string, AuthUserRead> = new Map();

  async createUser(authUser: AuthUserWrite): Promise<void> {
    this.authUsers.set(authUser.email, { ...authUser, emailConfirmed: false });
  }
}

class RegisterHelper {
  constructor(private readonly authUserRepository: AuthUserRepository) {}
  async execute(
    command: RegisterHelperCommand
  ): Promise<Result<undefined, Error>> {
    const guard = Result.combineObject({
      email: HelperEmail.create(command.email),
      firstname: Firstname.create(command.firstname),
      lastname: Lastname.create(command.lastname),
    });

    if (Result.isFailure(guard)) {
      return guard;
    }

    try {
      await this.authUserRepository.createUser(command);
    } catch (error) {}
    return Result.ok(undefined);
  }
}

type RegisterHelperError = InvalidEmailError;

export type RegisterHelperResult = ReturnType<
  typeof RegisterHelper.prototype.execute
>;

class RegisterHelperUnitTestHarness {
  status: Awaited<RegisterHelperResult> | undefined;

  private constructor(
    private readonly authUserRepository: InMemoryAuthUserRepository,
    private readonly registerHelperUsecase: RegisterHelper
  ) {}

  static setup() {
    const authUserRepository = new InMemoryAuthUserRepository();
    const registerHelper = new RegisterHelper(authUserRepository);
    return new this(authUserRepository, registerHelper);
  }

  async registerHelper(command: RegisterHelperCommand) {
    this.status = await this.registerHelperUsecase.execute(command);
  }

  didHelperRegisterSuccessfully() {
    if (this.status) {
      return Result.isSuccess(this.status);
    }
    return false;
  }

  expectRegistrationFailedWithError(error: DomainError) {
    expect((this.status as Failure).error.name).toBe(error);
  }

  didHelperConfirmedEmailYet(email: string) {
    return this.authUserRepository.authUsers.get(email)?.emailConfirmed;
  }
}
