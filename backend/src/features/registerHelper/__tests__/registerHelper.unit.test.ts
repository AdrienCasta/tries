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
import PhoneNumber, {
  PhoneNumberError,
} from "@shared/domain/value-objects/PhoneNumber";
import Profession from "@shared/domain/value-objects/Profession";
import Residence, {
  ResidenceError,
} from "@shared/domain/value-objects/Residence";
import { Clock } from "@shared/domain/services/Clock";
import Birthdate from "@shared/domain/value-objects/Birthdate";
import { FixedClock } from "@infrastructure/time/FixedClock";
import PlaceOfBirth from "@shared/domain/value-objects/PlaceOfBirth";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "Email is required": "InvalidEmailError",
  "Invalid email format": "InvalidEmailError",
  "First name too short": "FirstnameTooShortError",
  "Last name too short": "LastnameTooShortError",
  "Phone number invalid": "PhoneNumberError",
  "this email address is already in use.": "EmailAlreadyInUseError",
  "this phone number is already in use.": "PhoneAlreadyInUseError",
  "birthdate provided is set to the future.": "BirthdateInFutureError",
  "age requirement not met. You must be at least 16 yo.": "TooYoungToWorkError",
  "Place of birth incomplete": "PlaceOfBirthIncompleteError",
  "Profession unkwown": "UnkwonProfessionError",
  "Rpps must be 11 digits long": "RppsInvalidError",
  "Adeli must be 9 digits long": "AdeliInvalidError",
  "Profession requires different health id type": "WrongHealthIdTypeError",
  "Invalid French area code": "ResidenceError",
  "Invalid residence": "ResidenceError",
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
      phoneNumber: overrides?.phoneNumber ?? "+33612345678",
      birthdate: overrides?.birthdate ?? new Date("1990-01-01"),
      placeOfBirth: overrides?.placeOfBirth ?? {
        country: "FR",
        city: "Paris",
      },
      professions: overrides?.professions ?? [
        {
          code: "physiotherapist",
          healthId: { rpps: "12345678901" },
        },
      ],
      residence: overrides?.residence ?? {
        country: "FR",
        frenchAreaCode: "75",
      },
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

    ScenarioOutline(
      "Fail to register with invalid phone number",
      ({ When, Then, And }, { phoneNumber, error }) => {
        const command = RegisterHelperCommandFixture.aValidCommand({
          phoneNumber,
        });
        When(
          "I submit my information with an invalid phone number: <phoneNumber>",
          () => {
            harness.registerHelper(command);
          }
        );
        Then("I am notified it went wrong because <error>", async () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });
        And(
          "notified I have to change my phone number information",
          async () => {
            harness.expectRegistrationFailedWithError(error);
          }
        );
      }
    );

    ScenarioOutline(
      "Cannot register with duplicate email",
      ({ Given, When, Then, And }, { email, error }) => {
        const existingCommand = RegisterHelperCommandFixture.aValidCommand({
          email,
        });
        const duplicateCommand = RegisterHelperCommandFixture.aValidCommand({
          email,
        });

        Given(
          'a helper with email "<email>" is already registered',
          async () => {
            await harness.registerHelper(existingCommand);
            expect(harness.didHelperRegisterSuccessfully()).toBe(true);
          }
        );

        When("I attempt to register with the same email", async () => {
          await harness.registerHelper(duplicateCommand);
        });

        Then("I am notified it went wrong because <error>", () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And("I must use a different email to proceed", () => {
          harness.expectRegistrationFailedWithError(error);
        });
      }
    );

    ScenarioOutline(
      "Cannot register with duplicate phone number",
      ({ Given, When, Then, And }, { phoneNumber, error }) => {
        const existingCommand = RegisterHelperCommandFixture.aValidCommand({
          phoneNumber,
        });
        const duplicateCommand = RegisterHelperCommandFixture.aValidCommand({
          phoneNumber,
        });

        Given(
          'a helper with phone number "<phoneNumber>" is already registered',
          async () => {
            await harness.registerHelper(existingCommand);
            expect(harness.didHelperRegisterSuccessfully()).toBe(true);
          }
        );

        When("I attempt to register with the same phone number", async () => {
          await harness.registerHelper(duplicateCommand);
        });

        Then("I am notified it went wrong because <error>", () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And("I must use a different phone number to proceed", () => {
          harness.expectRegistrationFailedWithError(error);
        });
      }
    );

    ScenarioOutline(
      "Cannot register with invalid birthdate",
      ({ Given, When, Then, And }, { currentDate, birthdate, error }) => {
        Given("it is <currentDate>", () => {
          harness = RegisterHelperUnitTestHarness.setup(new Date(currentDate));
        });

        When("I submit my birthdate as <birthdate>", async () => {
          const command = RegisterHelperCommandFixture.aValidCommand({
            birthdate: new Date(birthdate),
          });
          await harness.registerHelper(command);
        });

        Then("I am notified it went wrong because <error>", () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And("I must provide a valid birthdate to proceed", () => {
          harness.expectRegistrationFailedWithError(error);
        });
      }
    );

    ScenarioOutline(
      "Cannot register with invalid place of birth",
      ({ When, Then, And }, { country, city, error }) => {
        When(
          'I submit my place of birth with country "<country>" and city "<city>"',
          async () => {
            const command = RegisterHelperCommandFixture.aValidCommand({
              placeOfBirth: { country, city },
            });
            await harness.registerHelper(command);
          }
        );

        Then("I am notified it went wrong because <error>", () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And("I must provide a valid place of birth to proceed", () => {
          harness.expectRegistrationFailedWithError(error);
        });
      }
    );

    ScenarioOutline(
      "Cannot register with invalid profession",
      ({ When, Then, And }, { profession, healthIdType, healthId, error }) => {
        When(
          'I submit my profession as "<profession>" with health ID "<healthIdType>" "<healthId>"',
          async () => {
            const healthIdObj =
              healthIdType === "rpps"
                ? { rpps: healthId }
                : { adeli: healthId };
            const command = RegisterHelperCommandFixture.aValidCommand({
              professions: [
                {
                  code: profession,
                  healthId: healthIdObj,
                },
              ],
            });
            await harness.registerHelper(command);
          }
        );

        Then("I am notified it went wrong because <error>", () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And("I must provide valid profession information to proceed", () => {
          harness.expectRegistrationFailedWithError(error);
        });
      }
    );

    ScenarioOutline(
      "Cannot register with invalid residence",
      ({ When, Then, And }, { country, frenchAreaCode, error }) => {
        When(
          'I submit my residence with country "<country>" and French area code "<frenchAreaCode>"',
          async () => {
            const command = RegisterHelperCommandFixture.aValidCommand({
              residence: {
                country,
                frenchAreaCode: frenchAreaCode || undefined,
              },
            });
            await harness.registerHelper(command);
          }
        );

        Then("I am notified it went wrong because <error>", () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And("I must provide a valid residence to proceed", () => {
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
  phoneNumber: string;
  birthdate: Date;
  placeOfBirth: {
    country: string;
    city: string;
  };
  professions: Array<{
    code: string;
    healthId: { rpps: string } | { adeli: string };
  }>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
};

interface AuthUserRead {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  emailConfirmed: boolean;
}
interface AuthUserWrite {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
}

interface AuthUserRepository {
  createUser(authUser: AuthUserWrite): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhoneNumber(phoneNumber: string): Promise<boolean>;
}

class EmailAlreadyInUseError extends Error {
  readonly name = "EmailAlreadyInUseError";
  constructor(readonly email: string) {
    super("this email address is already in use.");
  }
}

class PhoneAlreadyInUseError extends Error {
  readonly name = "PhoneAlreadyInUseError";
  constructor(readonly phoneNumber: string) {
    super("this phone number is already in use.");
  }
}

class InMemoryAuthUserRepository implements AuthUserRepository {
  authUsers: Map<string, AuthUserRead> = new Map();

  async createUser(authUser: AuthUserWrite): Promise<void> {
    this.authUsers.set(authUser.email, {
      ...authUser,
      emailConfirmed: false,
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.authUsers.has(email);
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    for (const user of this.authUsers.values()) {
      if (user.phoneNumber === phoneNumber) {
        return true;
      }
    }
    return false;
  }
}

class RegisterHelper {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly clock: Clock
  ) {}

  async execute(
    command: RegisterHelperCommand
  ): Promise<Result<undefined, Error>> {
    const guard = Result.combineObject({
      email: HelperEmail.create(command.email),
      firstname: Firstname.create(command.firstname),
      lastname: Lastname.create(command.lastname),
      phoneNumber: PhoneNumber.create(command.phoneNumber),
      birthdate: Birthdate.create(command.birthdate, { clock: this.clock }),
      placeOfBirth: PlaceOfBirth.create(command.placeOfBirth),
      professions: Profession.createMany(command.professions as any),
      residence:
        command.residence.country === "FR"
          ? Residence.createFrenchResidence(
              command.residence.frenchAreaCode as string
            )
          : Residence.createForeignResidence(command.residence.country),
    });

    if (Result.isFailure(guard)) {
      return guard;
    }

    const duplicateEmailCheck = await this.checkDuplicateEmail(command.email);
    if (Result.isFailure(duplicateEmailCheck)) {
      return duplicateEmailCheck;
    }

    const duplicatePhoneCheck = await this.checkDuplicatePhoneNumber(
      command.phoneNumber
    );
    if (Result.isFailure(duplicatePhoneCheck)) {
      return duplicatePhoneCheck;
    }

    try {
      await this.authUserRepository.createUser(command);
    } catch (error) {}
    return Result.ok(undefined);
  }

  private async checkDuplicateEmail(
    email: string
  ): Promise<Result<undefined, EmailAlreadyInUseError>> {
    const exists = await this.authUserRepository.existsByEmail(email);
    if (exists) {
      return Result.fail(new EmailAlreadyInUseError(email));
    }
    return Result.ok(undefined);
  }

  private async checkDuplicatePhoneNumber(
    phoneNumber: string
  ): Promise<Result<undefined, PhoneAlreadyInUseError>> {
    const exists = await this.authUserRepository.existsByPhoneNumber(
      phoneNumber
    );
    if (exists) {
      return Result.fail(new PhoneAlreadyInUseError(phoneNumber));
    }
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

  static setup(currentTime?: Date) {
    const authUserRepository = new InMemoryAuthUserRepository();
    const registerHelper = new RegisterHelper(
      authUserRepository,
      new FixedClock(currentTime)
    );
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
