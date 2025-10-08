import { expect } from "vitest";
import { ConfirmHelperEmailCommand } from "../ConfirmHelperEmail.command.js";
import {
  ConfirmHelperEmail,
  ConfirmHelperEmailResult,
} from "../ConfirmHelperEmail.usecase.js";
import { Failure, Result } from "@shared/infrastructure/Result.js";
import DomainError from "@shared/infrastructure/DomainError.js";
import { FakeEmailConfirmationService } from "./fakes/FakeEmailConfirmationService.js";
import { FixedClock } from "@infrastructure/time/FixedClock.js";

export default class ConfirmHelperEmailUnderTest {
  private emailConfirmationService!: FakeEmailConfirmationService;
  private clock!: FixedClock;
  private useCase!: ConfirmHelperEmail;
  private usecaseResult!: Awaited<ConfirmHelperEmailResult>;

  setup(): void {
    this.emailConfirmationService = new FakeEmailConfirmationService();
    this.clock = new FixedClock();

    this.useCase = new ConfirmHelperEmail(
      this.emailConfirmationService,
      this.clock
    );
  }

  givenTokenExists(token: string): void {
    this.emailConfirmationService.registerToken(token);
  }

  givenTokenExpired(token: string): void {
    this.emailConfirmationService.markTokenAsExpired(token);
  }

  givenEmailAlreadyConfirmed(token: string): void {
    this.emailConfirmationService.markEmailAsConfirmed(token);
  }

  async confirmEmail(command: ConfirmHelperEmailCommand): Promise<void> {
    this.usecaseResult = await this.useCase.execute(command);
  }

  async assertConfirmationSucceeded(): Promise<void> {
    expect(this.usecaseResult).not.toBeNull();
    expect(Result.isSuccess(this.usecaseResult)).toBe(true);
  }

  async assertConfirmationFailed(): Promise<void> {
    expect(this.usecaseResult).not.toBeNull();
    expect(Result.isFailure(this.usecaseResult)).toBe(true);
  }

  async assertConfirmationFailedWithError(errorCode: string): Promise<void> {
    expect(this.usecaseResult).not.toBeNull();
    expect(Result.isFailure(this.usecaseResult)).toBe(true);
    expect((this.usecaseResult as Failure<DomainError>).error.code).toBe(
      errorCode
    );
  }
}
