import DomainError from "@shared/domain/DomainError.js";
import { Result } from "../../infrastructure/Result.js";
import FrenchAreaCode from "./FrenchAreaCode.js";

const COUNTRIES_WITHOUT_FRENCH_AREA_CODE_REQUIREMENT = [
  "BE",
  "DE",
  "CH",
  "ES",
  "IT",
] as const;

export default class Residence {
  readonly value: ResidenceValue;

  private constructor(value: ResidenceValue) {
    this.value = value;
  }

  static createFrenchResidence(
    frenchAreaCode: string
  ): Result<Residence, ResidenceError> {
    const countyResult = FrenchAreaCode.create(frenchAreaCode);

    if (Result.isFailure(countyResult)) {
      return Result.fail(
        new ResidenceError("FR", frenchAreaCode, countyResult.error.message)
      );
    }

    return Result.ok(new Residence({ country: "FR", frenchAreaCode }));
  }

  static createForeignResidence(
    country: string
  ): Result<Residence, ResidenceError> {
    if (country === "FR") {
      return Result.fail(
        new ResidenceError(country, "", "Use createFrenchResidence for France")
      );
    }

    const validCountries = COUNTRIES_WITHOUT_FRENCH_AREA_CODE_REQUIREMENT;
    if (!validCountries.includes(country as any)) {
      return Result.fail(
        new ResidenceError(
          country,
          "",
          `Country must be one of: ${validCountries.join(", ")}`
        )
      );
    }

    return Result.ok(new Residence({ country }));
  }

  toValue() {
    return this.value;
  }
}

type ResidenceValue = {
  country: string;
  frenchAreaCode?: string;
};

export class ResidenceError extends DomainError {
  readonly code = "RESIDENCE_INVALID";
  constructor(country: string, frenchAreaCode: string, reason?: string) {
    super("Invalid residence", { country, frenchAreaCode, reason });
    this.name = this.constructor.name;
  }
}
