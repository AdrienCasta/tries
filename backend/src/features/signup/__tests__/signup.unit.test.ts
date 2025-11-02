import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import { Failure, Result } from "@shared/infrastructure/Result";

import Signup, { SignupResult } from "../signup.usecase";
import InMemoryAuthService from "@infrastructure/auth/InMemoryAuthService.js";
import InMemoryUserRepository from "@infrastructure/persistence/InMemoryUserRepository.js";
import SignupCommand from "../signup.command";
import SignupCommandFixture from "./fixtures/SignupCommandFixture";

//@ts-ignore
import featureContent from "../../../../../features/signup.feature?raw";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "Email is required": "InvalidEmailError",
  "Invalid email format": "InvalidEmailError",
  "Email already in use": "EmailAlreadyInUseError",
};

setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, ScenarioOutline, Scenario, Background }) => {
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

    // Password validation test removed - signup is now passwordless with OTP

    Scenario(
      "Cannot sign up with duplicate email",
      ({ Given, When, Then, And }) => {
        const existingCommand = SignupCommandFixture.aValidCommand({
          email: "john@example.com",
        });
        const duplicateCommand = SignupCommandFixture.aValidCommand({
          email: "john@example.com",
          
        });

        Given(
          'a user with email "john@example.com" already exists',
          async () => {
            await harness.signup(existingCommand);
            expect(harness.didSignupSucceed()).toBe(true);
          }
        );

        When("I attempt to sign up with the same email", async () => {
          await harness.signup(duplicateCommand);
        });

        Then(
          'I am notified it went wrong because "Email already in use"',
          () => {
            expect(harness.didSignupSucceed()).toBe(false);
          }
        );

        And("I must use a different email to proceed", () => {
          harness.expectSignupFailedWithError("EmailAlreadyInUseError");
        });
      }
    );
  }
);

class SignupUnitTestHarness {
  status: Awaited<SignupResult> | undefined;

  private constructor(
    private readonly authService: InMemoryAuthService,
    private readonly userRepository: InMemoryUserRepository,
    private readonly signupUsecase: Signup
  ) {}

  static setup() {
    const authService = new InMemoryAuthService();
    const userRepository = new InMemoryUserRepository();
    const signup = new Signup(authService, userRepository);
    return new this(authService, userRepository, signup);
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

  expectSignupFailedWithError(error: string) {
    expect((this.status as Failure).error.name).toBe(error);
  }

  isEmailConfirmed(email: string) {
    return this.authService.authUsers.get(email)?.emailConfirmed;
  }
}
