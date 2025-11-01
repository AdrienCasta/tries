import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import { Result } from "@shared/infrastructure/Result";
import VerifyOtp from "../verify-otp.usecase";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";
import VerifyOtpCommandFixture from "./fixtures/VerifyOtpCommandFixture";
import VerifyOtpCommand from "../verify-otp.command";

// @ts-ignore
import featureContent from "../../../../../features/verify-email.feature?raw";
const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "OTP is required": "OtpEmptyError",
  "OTP must be 6 digits": "OtpInvalidLengthError",
  "OTP must contain only digits": "OtpInvalidFormatError",
  "OTP expired": "OtpExpiredError",
  "Invalid OTP": "InvalidOtpError",
};

setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario, ScenarioOutline, Background }) => {
    let harness: VerifyOtpTestHarness;

    BeforeEachScenario(async () => {
      harness = await VerifyOtpTestHarness.setup();
    });

    Background(({ Given }) => {
      Given("I am a user who has signed up", () => {});
    });

    Scenario("User verifies email successfully", ({ When, Then, And }) => {
      When("I submit a valid OTP code", async () => {
        await harness.sendOtpToUser();
        await harness.verifyWithValidOtp();
      });

      Then("my email is verified", () => {
        expect(harness.isEmailVerified()).toBe(true);
      });

      And("I am notified verification was successful", () => {
        expect(harness.didVerificationSucceed()).toBe(true);
      });
    });

    ScenarioOutline(
      "Cannot verify with invalid OTP format",
      ({ When, Then, And }, { code, error }) => {
        When('I submit OTP code "<code>"', async () => {
          const command = VerifyOtpCommandFixture.aValidCommand({
            otpCode: code,
          });
          await harness.verifyOtp(command);
        });

        Then('verification fails with "<error>"', () => {
          expect(harness.didVerificationSucceed()).toBe(false);
        });

        And("I am notified to check the code", () => {
          harness.expectVerificationFailedWithError(error);
        });
      }
    );

    Scenario("Cannot verify with expired OTP", ({ Given, When, Then, And }) => {
      Given("I have an expired OTP code", async () => {
        await harness.sendOtpToUser();
        harness.expireOtp();
      });

      When("I submit the expired OTP", async () => {
        await harness.verifyWithExpiredOtp();
      });

      Then('verification fails with "OTP expired"', () => {
        expect(harness.didVerificationSucceed()).toBe(false);
      });

      And("I am prompted to request a new code", () => {
        harness.expectVerificationFailedWithError("OtpExpiredError");
      });
    });

    Scenario("Cannot verify with wrong OTP", ({ Given, When, Then, And }) => {
      Given("I have a valid OTP in my email", async () => {
        await harness.sendOtpToUser();
      });

      When("I submit a different 6-digit code", async () => {
        const command = VerifyOtpCommandFixture.aValidCommand({
          otpCode: "999999",
        });
        await harness.verifyOtp(command);
      });

      Then('verification fails with "Invalid OTP"', () => {
        expect(harness.didVerificationSucceed()).toBe(false);
      });

      And("I can retry with the correct code", () => {
        harness.expectVerificationFailedWithError("InvalidOtpError");
      });
    });
  }
);

class VerifyOtpTestHarness {
  private result: any;
  private readonly testEmail = "test@example.com";
  private validOtp: string = "";

  private constructor(
    private readonly repository: InMemoryAuthUserRepository,
    private readonly useCase: VerifyOtp
  ) {}

  static async setup() {
    const repository = new InMemoryAuthUserRepository();
    const useCase = new VerifyOtp(repository);
    const harness = new this(repository, useCase);
    await harness.createUnconfirmedUser();
    return harness;
  }

  async createUnconfirmedUser() {
    await this.repository.createUser({
      email: this.testEmail,
      password: "Test123!",
    });
  }

  async sendOtpToUser() {
    await this.repository.sendOtp(this.testEmail);
    this.validOtp = this.repository.getLastOtpCode(this.testEmail);
  }

  async verifyWithValidOtp() {
    const command = VerifyOtpCommandFixture.aValidCommand({
      email: this.testEmail,
      otpCode: this.validOtp,
    });
    this.result = await this.useCase.execute(command);
  }

  async verifyOtp(command: VerifyOtpCommand) {
    this.result = await this.useCase.execute(command);
  }

  expireOtp() {
    this.repository.expireOtp(this.testEmail);
  }

  async verifyWithExpiredOtp() {
    const command = VerifyOtpCommandFixture.aValidCommand({
      email: this.testEmail,
      otpCode: this.validOtp,
    });
    this.result = await this.useCase.execute(command);
  }

  didVerificationSucceed() {
    return this.result ? Result.isSuccess(this.result) : false;
  }

  isEmailVerified() {
    const user = this.repository.authUsers.get(this.testEmail);
    return user?.emailConfirmed === true;
  }

  expectVerificationFailedWithError(errorCode: string) {
    if (this.result && Result.isFailure(this.result)) {
      expect((this.result.error as Error).name).toBe(errorCode);
    } else {
      throw new Error("Expected verification to fail but it succeeded");
    }
  }
}
