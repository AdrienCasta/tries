import {
  describeFeature,
  getVitestCucumberConfiguration,
  loadFeatureFromText,
  setVitestCucumberConfiguration,
} from "@amiceli/vitest-cucumber";
import featureContent from "../../../../../features/resend-otp.feature?raw";
import { Result } from "@shared/infrastructure/Result";
import ResendOtp from "../resend-otp.usecase";
import InMemoryAuthUserRepository from "@infrastructure/persistence/InMemoryAuthUserRepository";
import ResendOtpCommandFixture from "./fixtures/ResendOtpCommandFixture";
import ResendOtpCommand from "../resend-otp.command";

const feature = await loadFeatureFromText(featureContent);

const errorMessageMappedToErrorCode = {
  "User not found": "UserNotFoundError",
};

setVitestCucumberConfiguration({
  ...getVitestCucumberConfiguration(),
  mappedExamples: errorMessageMappedToErrorCode,
});

describeFeature(
  feature,
  ({ BeforeEachScenario, Scenario, Background, Given }) => {
    let harness: ResendOtpTestHarness;

    BeforeEachScenario(async () => {
      harness = await ResendOtpTestHarness.setup();
    });

    Background(({ Given }) => {
      Given("I have signed up with an email address", () => {});
    });

    Scenario("User requests new OTP successfully", ({ When, Then, And }) => {
      When("I request a new OTP code", async () => {
        await harness.resendOtp();
      });

      Then("a new OTP is sent to my email", () => {
        expect(harness.wasOtpSent()).toBe(true);
      });

      And("I am notified to check my inbox", () => {
        expect(harness.didResendSucceed()).toBe(true);
      });
    });

    Scenario("Cannot request OTP for non-existent user", ({ Given, When, Then }) => {
      Given("I use an email that is not registered", () => {
        harness.useNonExistentEmail();
      });

      When("I request a new OTP code", async () => {
        await harness.resendOtp();
      });

      Then('the request fails with "User not found"', () => {
        expect(harness.didResendSucceed()).toBe(false);
        harness.expectResendFailedWithError("UserNotFoundError");
      });
    });

    Scenario("New OTP invalidates previous OTP", ({ Given, When, And, Then, But }) => {
      Given("I have received an OTP code", async () => {
        await harness.sendInitialOtp();
      });

      When("I request a new OTP code", async () => {
        await harness.resendOtp();
      });

      And("I try to verify with the old OTP", async () => {
        await harness.verifyWithOldOtp();
      });

      Then("verification should fail", () => {
        expect(harness.didOldOtpVerificationSucceed()).toBe(false);
      });

      But("verification succeeds with the new OTP", async () => {
        await harness.verifyWithNewOtp();
        expect(harness.didNewOtpVerificationSucceed()).toBe(true);
      });
    });
  }
);

class ResendOtpTestHarness {
  private resendResult: any;
  private oldOtpVerificationResult: any;
  private newOtpVerificationResult: any;
  private readonly testEmail = "test@example.com";
  private currentEmail: string = "test@example.com";
  private oldOtp: string = "";
  private newOtp: string = "";

  private constructor(
    private readonly repository: InMemoryAuthUserRepository,
    private readonly useCase: ResendOtp
  ) {}

  static async setup() {
    const repository = new InMemoryAuthUserRepository();
    const useCase = new ResendOtp(repository);
    const harness = new this(repository, useCase);
    await harness.createUser();
    return harness;
  }

  async createUser() {
    await this.repository.createUser({
      email: this.testEmail,
      password: "Test123!",
    });
  }

  async resendOtp() {
    const command = ResendOtpCommandFixture.aValidCommand({
      email: this.currentEmail,
    });
    this.resendResult = await this.useCase.execute(command);
    if (Result.isSuccess(this.resendResult)) {
      this.newOtp = this.repository.getLastOtpCode(this.currentEmail);
    }
  }

  useNonExistentEmail() {
    this.currentEmail = "nonexistent@example.com";
  }

  async sendInitialOtp() {
    await this.repository.sendOtp(this.testEmail);
    this.oldOtp = this.repository.getLastOtpCode(this.testEmail);
  }

  async verifyWithOldOtp() {
    this.oldOtpVerificationResult = await this.repository.verifyOtp(
      this.testEmail,
      this.oldOtp
    );
  }

  async verifyWithNewOtp() {
    this.newOtpVerificationResult = await this.repository.verifyOtp(
      this.testEmail,
      this.newOtp
    );
  }

  wasOtpSent(): boolean {
    return this.repository.getLastOtpCode(this.currentEmail).length === 6;
  }

  didResendSucceed(): boolean {
    return this.resendResult ? Result.isSuccess(this.resendResult) : false;
  }

  didOldOtpVerificationSucceed(): boolean {
    return this.oldOtpVerificationResult
      ? Result.isSuccess(this.oldOtpVerificationResult)
      : false;
  }

  didNewOtpVerificationSucceed(): boolean {
    return this.newOtpVerificationResult
      ? Result.isSuccess(this.newOtpVerificationResult)
      : false;
  }

  expectResendFailedWithError(errorCode: string) {
    if (this.resendResult && Result.isFailure(this.resendResult)) {
      expect(this.resendResult.error.name).toBe(errorCode);
    } else {
      throw new Error("Expected resend to fail but it succeeded");
    }
  }
}
