import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
// @ts-ignore
import featureContent from "../../../../../features/registerHelper.feature?raw";
import { Failure, Result } from "@shared/infrastructure/Result";
import { EmailFixtures } from "@shared/__tests__/fixtures/EmailFixtures";
import DomainError from "@shared/domain/DomainError";
import { FixedClock } from "@infrastructure/time/FixedClock";

import RegisterHelper, {
  RegisterHelperResult,
} from "../registerHelper.usecase";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";
import RegisterHelperCommand from "../registerHelper.command";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "Email is required": "InvalidEmailError",
  "Password is required": "PasswordEmptyError",
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
  "Diploma must be in PDF format": "InvalidDiplomaFormatError",
  "Diploma file size exceeds 10MB limit": "DiplomaSizeExceededError",
  "Criminal record certificate must be in PDF format":
    "InvalidCriminalRecordCertificateFormatError",
  "Criminal record certificate file size exceeds 10MB limit":
    "CriminalRecordCertificateSizeExceededError",
  "Criminal record certificate file is empty":
    "EmptyCriminalRecordCertificateFileError",
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
      password: overrides?.password ?? "12345AZERTpoiu!!!",
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
      diploma: overrides?.diploma,
      criminalRecordCertificate: overrides?.criminalRecordCertificate,
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
      "Helper fail to register with invalid password",
      ({ When, Then, And }, { password, error }) => {
        const command = RegisterHelperCommandFixture.aValidCommand({
          password,
        });

        When(
          "I submit my information with an invalid password <password>",
          () => {
            harness.registerHelper(command);
          }
        );
        Then("I am notified it went wrong because of <error>", () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });
        And("notified I have to change my password", () => {
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

    ScenarioOutline(
      "Cannot register with invalid diploma file format",
      ({ When, Then, And }, { fileType, error }) => {
        When(
          'I submit my registration with a diploma file of type "<fileType>"',
          async () => {
            const command = RegisterHelperCommandFixture.aValidCommand({
              diploma: { fileType },
            });
            await harness.registerHelper(command);
          }
        );

        Then("I am notified it went wrong because <error>", async () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And("I must provide a valid PDF diploma to proceed", async () => {
          harness.expectRegistrationFailedWithError(error);
        });
      }
    );

    ScenarioOutline(
      "Cannot register with diploma file exceeding size limit",
      ({ When, Then, And }, { fileSize, error }) => {
        const fileSizeInBytes = parseInt(fileSize) * 1024 * 1024;

        When(
          "I submit my registration with a diploma file of size <fileSize>",
          async () => {
            const command = RegisterHelperCommandFixture.aValidCommand({
              diploma: { fileType: ".pdf", fileSize: fileSizeInBytes },
            });
            await harness.registerHelper(command);
          }
        );

        Then("I am notified it went wrong because <error>", async () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And(
          "I must provide a diploma within the size limit to proceed",
          async () => {
            harness.expectRegistrationFailedWithError(error);
          }
        );
      }
    );

    ScenarioOutline(
      "Cannot register with invalid criminal record certificate file format",
      ({ When, Then, And }, { fileType, error }) => {
        When(
          'I submit my registration with a criminal record certificate file of type "<fileType>"',
          async () => {
            const command = RegisterHelperCommandFixture.aValidCommand({
              criminalRecordCertificate: { fileType },
            });
            await harness.registerHelper(command);
          }
        );

        Then("I am notified it went wrong because <error>", async () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And(
          "I must provide a valid PDF criminal record certificate to proceed",
          async () => {
            harness.expectRegistrationFailedWithError(error);
          }
        );
      }
    );

    ScenarioOutline(
      "Cannot register with criminal record certificate file exceeding size limit",
      ({ When, Then, And }, { fileSize, error }) => {
        const fileSizeInBytes = parseInt(fileSize) * 1024 * 1024;

        When(
          "I submit my registration with a criminal record certificate file of size <fileSize>",
          async () => {
            const command = RegisterHelperCommandFixture.aValidCommand({
              criminalRecordCertificate: {
                fileType: ".pdf",
                fileSize: fileSizeInBytes,
              },
            });
            await harness.registerHelper(command);
          }
        );

        Then("I am notified it went wrong because <error>", async () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And(
          "I must provide a criminal record certificate within the size limit to proceed",
          async () => {
            harness.expectRegistrationFailedWithError(error);
          }
        );
      }
    );

    ScenarioOutline(
      "Cannot register with empty criminal record certificate file",
      ({ When, Then, And }, { error }) => {
        When(
          "I submit my registration with an empty criminal record certificate file",
          async () => {
            const command = RegisterHelperCommandFixture.aValidCommand({
              criminalRecordCertificate: { fileType: ".pdf", fileSize: 0 },
            });
            await harness.registerHelper(command);
          }
        );

        Then("I am notified it went wrong because <error>", async () => {
          expect(harness.didHelperRegisterSuccessfully()).toBe(false);
        });

        And(
          "I must provide a valid criminal record certificate file to proceed",
          async () => {
            harness.expectRegistrationFailedWithError(error);
          }
        );
      }
    );
  }
);

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
