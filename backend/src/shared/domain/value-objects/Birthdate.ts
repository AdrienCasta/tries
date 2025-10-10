import { SystemClock } from "@infrastructure/time/SystemClock.js";
import { Result } from "../../infrastructure/Result.js";
import DomainError from "@shared/domain/DomainError.js";

export default class Birthdate {
  readonly value: Date;

  private constructor(birthdate: Date) {
    this.value = birthdate;
  }

  static create(
    birthdate: Date,
    { clock } = { clock: new SystemClock() }
  ): Result<Birthdate, BirthdateInFuturError | TooYoungToWorkError> {
    if (isDateAfterGivenDate(birthdate, clock.now())) {
      return Result.fail(new BirthdateInFuturError(birthdate));
    }

    if (isTooYoungToWork(birthdate, clock.now())) {
      return Result.fail(new TooYoungToWorkError(birthdate));
    }
    return Result.ok(new Birthdate(birthdate));
  }

  toValue(): Date {
    return this.value;
  }
}

function isDateAfterGivenDate(dateToCheck: Date, givenDate: Date) {
  return dateToCheck.getTime() >= givenDate.getTime();
}
function isTooYoungToWork(dateToCheck: Date, givenDate: Date, minAge = 16) {
  const cutoffDate = givenDate;
  cutoffDate.setFullYear(cutoffDate.getFullYear() - minAge);

  return dateToCheck.getTime() > cutoffDate.getTime();
}

export class BirthdateInFuturError extends DomainError {
  readonly code = "BIRTHDATE_IN_FUTUR";
  constructor(birthdate: Date) {
    super("Birthdate provided is set to the future", { birthdate });
  }
}
export class TooYoungToWorkError extends DomainError {
  readonly code = "TOO_YOUNG_TO_WORK";
  constructor(birthdate: Date) {
    super("Age requirement not met. You must be at least 16 yo", { birthdate });
  }
}
