import DomainError from "@shared/domain/DomainError.js";
import { Result } from "../../infrastructure/Result.js";

export default class FrenchAreaCode {
  readonly value: string;

  private constructor(value: string) {
    this.value = value.trim();
  }

  static create(county: string): Result<FrenchAreaCode, FrenchAreaCodeError> {
    const trimmedCounty = county?.trim();

    if (!isValidfrenchAreaCodes(trimmedCounty)) {
      return Result.fail(new FrenchAreaCodeError(county));
    }

    return Result.ok(new FrenchAreaCode(trimmedCounty));
  }

  toValue(): string {
    return this.value;
  }
}

function isValidfrenchAreaCodes(county: string): boolean {
  if (!county || county === "") {
    return false;
  }
  const countyRegex =
    /^(0[1-9]|1[0-9]|2[1-9AB]|[3-8][0-9]|9[0-5]|97[1-4]|976)$/;
  return countyRegex.test(county);
}

export class FrenchAreaCodeError extends DomainError {
  readonly code = "FRENCH_AREA_CODE_INVALID";
  constructor(county: string) {
    super("Invalid French area code", { county });
  }
}
