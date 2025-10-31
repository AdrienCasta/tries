import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import featureContent from "../../../../features/signup.feature?raw";
import { Failure, Result } from "@shared/infrastructure/Result";
import DomainError from "@shared/domain/DomainError";

import Signup, { SignupResult } from "../signup.usecase";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";
import SignupCommand from "../signup.command";
import SignupCommandFixture from "./fixtures/SignupCommandFixture";

const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "Email is required": "InvalidEmailError",
  "Invalid email format": "InvalidEmailError",
  "Password is required": "PasswordEmptyError",
  "Password too short": "PasswordTooShortError",
  "Password format invalid": "PasswordFormatError",
  "Email already in use": "EmailAlreadyInUseError",
};

setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, ScenarioOutline, Scenario, Background, Given }) => {
    let harness: SignupUnitTestHarness;

    BeforeEachScenario(() => {
      harness = SignupUnitTestHarness.setup();
    });

    Background(({ Given }) => {
      Given("I am a new user wishing to sign up", () => {});
    });

    Scenario("User signs up successfully", ({ When, Then, And }) => {
      const command = SignupCommandFixture.aValidCommand();

      When("I submit my signup information", () => {
        harness.signup(command);
      });

      Then("I am notified signup was successful", async () => {
        expect(harness.didSignupSucceed()).toBe(true);
      });

      And("notified I have to confirm my email", () => {
        expect(harness.isEmailConfirmed(command.email)).toBe(false);
      });
    });

    ScenarioOutline(
      "Cannot sign up with invalid email",
      ({ When, Then, And }, { email, error }) => {
        const command = SignupCommandFixture.aValidCommand({ email });

        When('I submit signup with email "<email>"', () => {
          harness.signup(command);
        });

        Then("I am notified it went wrong because of <error>", () => {
          expect(harness.didSignupSucceed()).toBe(false);
        });

        And("notified I have to provide a valid email", () => {
          harness.expectSignupFailedWithError(error);
        });
      }
    );

    ScenarioOutline(
      "Cannot sign up with invalid password",
      ({ When, Then, And }, { password, error }) => {
        const command = SignupCommandFixture.aValidCommand({ password });

        When('I submit signup with password "<password>"', () => {
          harness.signup(command);
        });

        Then("I am notified it went wrong because of <error>", () => {
          expect(harness.didSignupSucceed()).toBe(false);
        });

        And("notified I have to provide a valid password", () => {
          harness.expectSignupFailedWithError(error);
        });
      }
    );

    Scenario("Cannot sign up with duplicate email", ({ Given, When, Then, And }) => {
      const existingCommand = SignupCommandFixture.aValidCommand({
        email: "john@example.com",
      });
      const duplicateCommand = SignupCommandFixture.aValidCommand({
        email: "john@example.com",
        password: "DifferentPass123!",
      });

      Given('a user with email "john@example.com" already exists', async () => {
        await harness.signup(existingCommand);
        expect(harness.didSignupSucceed()).toBe(true);
      });

      When("I attempt to sign up with the same email", async () => {
        await harness.signup(duplicateCommand);
      });

      Then('I am notified it went wrong because "Email already in use"', () => {
        expect(harness.didSignupSucceed()).toBe(false);
      });

      And("I must use a different email to proceed", () => {
        harness.expectSignupFailedWithError("EmailAlreadyInUseError");
      });
    });
  }
);

class SignupUnitTestHarness {
  status: Awaited<SignupResult> | undefined;

  private constructor(
    private readonly authUserRepository: InMemoryAuthUserRepository,
    private readonly signupUsecase: Signup
  ) {}

  static setup() {
    const authUserRepository = new InMemoryAuthUserRepository();
    const signup = new Signup(authUserRepository);
    return new this(authUserRepository, signup);
  }

  async signup(command: SignupCommand) {
    this.status = await this.signupUsecase.execute(command);
  }

  didSignupSucceed() {
    if (this.status) {
      return Result.isSuccess(this.status);
    }
    return false;
  }

  expectSignupFailedWithError(error: DomainError) {
    expect((this.status as Failure).error.name).toBe(error);
  }

  isEmailConfirmed(email: string) {
    return this.authUserRepository.authUsers.get(email)?.emailConfirmed;
  }
}
