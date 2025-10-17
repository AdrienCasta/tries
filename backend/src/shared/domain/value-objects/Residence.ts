import DomainError from "@shared/domain/DomainError.js";
import { Result } from "../../infrastructure/Result.js";
import FrenchCounty from "./FrenchCounty.js";

const COUNTRIES_WITHOUT_FRENCH_COUNTY_REQUIREMENT = [
  "Belgium",
  "Germany",
  "Switzerland",
  "Spain",
  "Italy",
] as const;

export default class Residence {
  readonly value: ResidenceValue;

  private constructor(value: ResidenceValue) {
    this.value = value;
  }

  static createFrenchResidence(
    frenchCounty: string
  ): Result<Residence, ResidenceError> {
    const countyResult = FrenchCounty.create(frenchCounty);

    if (Result.isFailure(countyResult)) {
      return Result.fail(
        new ResidenceError("France", frenchCounty, countyResult.error.message)
      );
    }

    return Result.ok(new Residence({ country: "France", frenchCounty }));
  }

  static createForeignResidence(
    country: string
  ): Result<Residence, ResidenceError> {
    if (country === "France") {
      return Result.fail(
        new ResidenceError(country, "", "Use createFrenchResidence for France")
      );
    }

    const validCountries = COUNTRIES_WITHOUT_FRENCH_COUNTY_REQUIREMENT;
    if (!validCountries.includes(country as any)) {
      return Result.fail(
        new ResidenceError(
          country,
          "",
          `Country must be one of: ${validCountries.join(", ")}`
        )
      );
    }

    return Result.ok(new Residence({ country, frenchCounty: "" }));
  }

  toValue() {
    return this.value;
  }
}

type ResidenceValue = { country: string; frenchCounty: string };

export class ResidenceError extends DomainError {
  readonly code = "RESIDENCE_INVALID";
  constructor(country: string, frenchCounty: string, reason?: string) {
    super("Invalid residence", { country, frenchCounty, reason });
  }
}
