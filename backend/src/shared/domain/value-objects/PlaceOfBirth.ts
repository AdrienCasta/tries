import DomainError from "@shared/domain/DomainError.js";
import { Result } from "../../infrastructure/Result.js";

export default class PlaceOfBirth {
  readonly value: PlaceOfBirthValue;

  private constructor(value: PlaceOfBirthValue) {
    this.value = value;
  }

  static create({
    country,
    city,
    zipCode,
  }: PlaceOfBirthValue): Result<PlaceOfBirth, PlaceOfBirthError> {
    return Result.ok(new PlaceOfBirth({ country, city, zipCode }));
  }

  toValue() {
    return this.value;
  }
}

type PlaceOfBirthValue = { country: string; city: string; zipCode?: string };

export class PlaceOfBirthError extends DomainError {
  readonly code = "PLACE_OF_BIRTH_INVALID";
  constructor(country: string, city: string, zipCode?: string) {
    super("Invalid place of birth", { country, city, zipCode });
  }
}
