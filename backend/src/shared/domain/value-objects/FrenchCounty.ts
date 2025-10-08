import DomainError from "@shared/infrastructure/DomainError.js";
import { Result } from "../../infrastructure/Result.js";

export default class FrenchCounty {
  readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(county: string): Result<FrenchCounty, FrenchCountyError> {
    const trimmedCounty = county?.trim();

    if (!isValidFrenchCounty(trimmedCounty)) {
      return Result.fail(new FrenchCountyError(county));
    }

    return Result.ok(new FrenchCounty(trimmedCounty));
  }

  toValue(): string {
    return this.value;
  }
}

function isValidFrenchCounty(county: string): boolean {
  if (!county || county === "") {
    return false;
  }
  const countyRegex = /^(0[1-9]|1[0-9]|2[1-9AB]|[3-8][0-9]|9[0-5]|97[1-4]|976)$/;
  return countyRegex.test(county);
}

export class FrenchCountyError extends DomainError {
  readonly code = "FRENCH_COUNTY_INVALID";
  constructor(county: string) {
    super("Invalid french county", { county });
  }
}
