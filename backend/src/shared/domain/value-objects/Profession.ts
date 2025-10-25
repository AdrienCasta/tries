import DomainError from "@shared/domain/DomainError";
import { Result } from "@shared/infrastructure/Result.js";
import Credential, { CredentialSizeExceededError, InvalidCredentialFormatError } from "./Credential.js";

export const VALID_PROFESSIONS = [
  "physiotherapist",
  "osteopath",
  "physical_trainer",
  "sports_coach",
  "first_responder",
  "sports_physiotherapist",
  "acupuncturist",
  "massage_therapist",
  "chiropractor",
  "mental_coach",
  "microkinesitherapist",
  "nurse",
  "doctor",
  "etiopath",
] as const;

export type ProfessionType = (typeof VALID_PROFESSIONS)[number];

export type ProfessionWithHealthId = {
  code: ProfessionType;
  healthId: { rpps: string } | { adeli: string };
  credential?: { fileType: string; fileSize?: number };
};

export default class Profession {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static createMany(
    professions: ProfessionWithHealthId[]
  ): Result<Profession[], ProfessionError> {
    const unknownProfessions = professions.filter(
      (profession) =>
        !VALID_PROFESSIONS.includes(profession.code as ProfessionType)
    );

    if (unknownProfessions.length > 0) {
      return Result.fail(
        new UnkwonProfessionError(unknownProfessions.map((p) => p.code))
      );
    }

    for (const profession of professions) {
      const validationResult = hasValidHealthIdType(
        profession as ProfessionWithHealthId
      );
      if (Result.isFailure(validationResult)) {
        return Result.fail(validationResult.error);
      }

      if (profession.credential) {
        const credentialResult = Credential.create(profession.credential);
        if (Result.isFailure(credentialResult)) {
          return Result.fail(credentialResult.error);
        }
      }
    }

    return Result.ok(
      professions.map((profession) => new Profession(profession.code))
    );
  }

  toValue(): string {
    return this.value;
  }
}

const PROFESSION_HEALTH_ID_REQUIREMENTS: Record<
  ProfessionType,
  { rpps?: boolean; adeli?: boolean }
> = {
  physiotherapist: { rpps: true },
  osteopath: { rpps: true, adeli: true },
  physical_trainer: { adeli: true },
  sports_coach: { adeli: true },
  first_responder: { adeli: true },
  sports_physiotherapist: { rpps: true },
  acupuncturist: { rpps: true },
  massage_therapist: { adeli: true },
  chiropractor: { rpps: true, adeli: true },
  mental_coach: { adeli: true },
  microkinesitherapist: { rpps: true },
  nurse: { rpps: true },
  doctor: { rpps: true },
  etiopath: { adeli: true },
};
const isValidHealthIdFormat = (
  healthIdType: "rpps" | "adeli",
  value: string
): boolean => {
  if (healthIdType === "rpps") {
    return /^\d{11}$/.test(value);
  }

  if (healthIdType === "adeli") {
    return /^\d{9}$/.test(value);
  }

  return false;
};

const hasValidHealthIdType = (
  profession: ProfessionWithHealthId
): Result<
  void,
  WrongHealthIdTypeError | RppsInvalidError | AdeliInvalidError
> => {
  const healthIdType = Object.keys(profession.healthId)[0] as "rpps" | "adeli";
  const healthIdValue =
    "rpps" in profession.healthId
      ? profession.healthId.rpps
      : profession.healthId.adeli;
  const requirements = PROFESSION_HEALTH_ID_REQUIREMENTS[profession.code];

  if (!requirements) {
    return Result.fail(
      new WrongHealthIdTypeError(profession.code, healthIdType, [])
    );
  }

  if (!requirements[healthIdType]) {
    const acceptedTypes = Object.keys(requirements).filter(
      (k) => requirements[k as "rpps" | "adeli"]
    ) as ("rpps" | "adeli")[];
    return Result.fail(
      new WrongHealthIdTypeError(profession.code, healthIdType, acceptedTypes)
    );
  }

  const isValidFormat = isValidHealthIdFormat(healthIdType, healthIdValue);
  if (!isValidFormat) {
    if (healthIdType === "rpps") {
      return Result.fail(new RppsInvalidError(profession.code, healthIdValue));
    } else {
      return Result.fail(new AdeliInvalidError(profession.code, healthIdValue));
    }
  }

  return Result.ok(undefined);
};

export type ProfessionError =
  | UnkwonProfessionError
  | InvalidProfessionHeathIdError
  | WrongHealthIdTypeError
  | RppsInvalidError
  | AdeliInvalidError
  | InvalidCredentialFormatError
  | CredentialSizeExceededError;

export class UnkwonProfessionError extends DomainError {
  readonly code = "UNKNOWN_PROFESSION";
  constructor(profession: string[]) {
    super("Profession unkwown", {
      profession,
      validProfessions: VALID_PROFESSIONS,
    });
  }
}

export class InvalidProfessionHeathIdError extends DomainError {
  readonly code = "INVALID_PROFESSION_HEALTH_ID";
  constructor(professionCodes: string[]) {
    const requirements = professionCodes.map((code) => {
      const req = PROFESSION_HEALTH_ID_REQUIREMENTS[code as ProfessionType];
      const validTypes = req
        ? Object.keys(req).filter((k) => req[k as "rpps" | "adeli"])
        : [];
      return { code, validHealthIdTypes: validTypes };
    });

    super("Invalid profession health id type or format", {
      professions: requirements,
    });
  }
}

export class WrongHealthIdTypeError extends DomainError {
  readonly code = "WRONG_HEALTH_ID_TYPE";
  constructor(
    professionCode: string,
    providedType: "rpps" | "adeli",
    acceptedTypes: ("rpps" | "adeli")[]
  ) {
    super("Profession requires different health id type", {
      professionCode,
      providedType,
      acceptedTypes,
    });
  }
}

export class RppsInvalidError extends DomainError {
  readonly code = "RPPS_INVALID";
  constructor(professionCode?: string, providedValue?: string) {
    super("Rpps must be 11 digits long", {
      ...(professionCode && { professionCode }),
      ...(providedValue && { providedValue, length: providedValue.length }),
    });
  }
}

export class AdeliInvalidError extends DomainError {
  readonly code = "ADELI_INVALID";
  constructor(professionCode?: string, providedValue?: string) {
    super("Adeli must be 9 digits long", {
      ...(professionCode && { professionCode }),
      ...(providedValue && { providedValue, length: providedValue.length }),
    });
  }
}
