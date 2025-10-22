import { Result } from "../../infrastructure/Result.js";
import DomainError from "@shared/domain/DomainError.js";

export default class Diploma {
  private static readonly MAX_SIZE_BYTES = 10 * 1024 * 1024;
  readonly value: DiplomaValue;

  private constructor(value: DiplomaValue) {
    this.value = value;
  }

  static create(props: {
    fileType: string;
    fileSize?: number;
  }): Result<Diploma, InvalidDiplomaFormatError | DiplomaSizeExceededError> {
    if (props.fileType !== ".pdf") {
      return Result.fail(new InvalidDiplomaFormatError(props.fileType));
    }

    if (
      props.fileSize &&
      props.fileSize > Diploma.MAX_SIZE_BYTES
    ) {
      return Result.fail(new DiplomaSizeExceededError(props.fileSize));
    }

    return Result.ok(new Diploma(props));
  }

  toValue(): DiplomaValue {
    return this.value;
  }
}

type DiplomaValue = {
  fileType: string;
  fileSize?: number;
};

export class InvalidDiplomaFormatError extends DomainError {
  readonly code = "INVALID_DIPLOMA_FORMAT";
  constructor(fileType: string) {
    super("Diploma must be in PDF format", { fileType });
    this.name = this.constructor.name;
  }
}

export class DiplomaSizeExceededError extends DomainError {
  readonly code = "DIPLOMA_SIZE_EXCEEDED";
  constructor(fileSize: number) {
    super("Diploma file size exceeds 10MB limit", { fileSize });
    this.name = this.constructor.name;
  }
}
