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
  }: PlaceOfBirthValue): Result<PlaceOfBirth, PlaceOfBirthIncompleteError> {
    if (!country || !city) {
      return Result.fail(new PlaceOfBirthIncompleteError(country, city));
    }
    return Result.ok(new PlaceOfBirth({ country, city }));
  }

  toValue() {
    return this.value;
  }
}

type PlaceOfBirthValue = { country: string; city: string };

export class PlaceOfBirthIncompleteError extends DomainError {
  constructor(country: string, city: string) {
    super("Invalid place of birth", { country, city });
    this.name = this.constructor.name;
  }
}
