import DomainError from "@shared/infrastructure/DomainError";
import { Result } from "@shared/infrastructure/Result.js";

export const VALID_PROFESSIONS = [
  "physiotherapist", // Kinésithérapeute
  "osteopath", // Ostéopathe
  "physical_trainer", // Préparateur Physique
  "sports_coach", // Coach sportif
  "first_responder", // Secouriste
  "sports_physiotherapist", // Kinésithérapeute du sport
  "acupuncturist", // Acupuncteur
  "massage_therapist", // Masseur
  "chiropractor", // Chiropracteur
  "mental_coach", // Préparateur Mental
  "microkinesitherapist", // Microkinesitherapeute
  "nurse", // Infirmier
  "doctor", // Médecin
  "etiopath", // Étiopathe
] as const;

export type ProfessionType = (typeof VALID_PROFESSIONS)[number];

export default class Profession {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(profession: string): Result<Profession, UnkwonProfessionError> {
    if (VALID_PROFESSIONS.includes(profession as ProfessionType)) {
      return Result.ok(new Profession(profession.trim()));
    }

    return Result.fail(new UnkwonProfessionError([profession]));
  }

  static createMany(
    professions: string[]
  ): Result<Profession[], UnkwonProfessionError> {
    const unknownProfessions = professions.filter(
      (profession) => !VALID_PROFESSIONS.includes(profession as ProfessionType)
    );
    if (unknownProfessions.length > 0) {
      return Result.fail(new UnkwonProfessionError(professions));
    }
    return Result.ok(
      professions.map((profession) => new Profession(profession))
    );
  }

  toValue(): string {
    return this.value;
  }
}

export type ProfessionError = UnkwonProfessionError;

export class UnkwonProfessionError extends DomainError {
  readonly code = "UNKNOWN_PROFESSION";
  constructor(profession: string[]) {
    super("Profession unkwown", {
      profession,
      validProfessions: VALID_PROFESSIONS,
    });
  }
}
