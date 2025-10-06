import { Result } from "@shared/infrastructure/Result.js";
import ValidationError from "@shared/infrastructure/ValidationError.js";

// Single source of truth for professions - ADD/REMOVE HERE ONLY
// NOTE: This is used for in-memory tests. Production uses database.
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

  /**
   * Create a single Profession (legacy - kept for backward compatibility)
   */
  static create(
    profession?: string
  ): Result<Profession | null, ValidationError> {
    // Optional field - return null if empty
    if (!profession || profession.trim().length === 0) {
      return Result.ok(null);
    }

    return Result.ok(new Profession(profession.trim()));
  }

  /**
   * Create multiple Professions from string array
   * Validates each profession and returns array or error
   */
  static createMany(
    professions?: string[]
  ): Result<Profession[], ValidationError> {
    // Empty array is valid
    if (!professions || professions.length === 0) {
      return Result.ok([]);
    }

    // Remove duplicates and empty strings
    const uniqueProfessions = Array.from(
      new Set(professions.map((p) => p.trim()).filter((p) => p.length > 0))
    );

    if (uniqueProfessions.length === 0) {
      return Result.ok([]);
    }

    return Result.ok(uniqueProfessions.map((p) => new Profession(p)));
  }

  /**
   * Validate professions against a list of valid profession names (from database)
   */
  static validateAgainstList(
    professions: Profession[],
    validProfessionNames: string[]
  ): Result<Profession[], ValidationError> {
    const invalidProfessions = professions.filter(
      (p) => !validProfessionNames.includes(p.value)
    );

    if (invalidProfessions.length > 0) {
      return Result.fail(ValidationError.professionInvalid());
    }

    return Result.ok(professions);
  }

  static getAllProfessions(): readonly ProfessionType[] {
    return VALID_PROFESSIONS;
  }

  toValue(): string {
    return this.value;
  }
}
