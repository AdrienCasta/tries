import Residence from "../../domain/value-objects/Residence.js";
import { Result } from "../../infrastructure/Result.js";

export class ResidenceFixtures {
  static aValidResidence(): Residence {
    const result = Residence.createFrenchResidence("44");

    if (Result.isFailure(result)) {
      throw new Error("Failed to create valid residence fixture");
    }

    return result.value;
  }

  static withCounty(frenchCounty: string): Residence {
    const result = Residence.createFrenchResidence(frenchCounty);

    if (Result.isFailure(result)) {
      throw new Error(`Failed to create residence with county ${frenchCounty}`);
    }

    return result.value;
  }

  static withCountryAndCounty(country: string, frenchCounty: string): Residence {
    const result =
      country === "France"
        ? Residence.createFrenchResidence(frenchCounty)
        : Residence.createForeignResidence(country);

    if (Result.isFailure(result)) {
      throw new Error(
        `Failed to create residence with country ${country} and county ${frenchCounty}`
      );
    }

    return result.value;
  }
}
