import { Result } from "../../infrastructure/Result.js";
import DomainError from "@shared/domain/DomainError.js";

export default class Credential {
  private static readonly MAX_SIZE_BYTES = 10 * 1024 * 1024;
  readonly value: CredentialValue;

  private constructor(value: CredentialValue) {
    this.value = value;
  }

  static create(props: {
    fileType: string;
    fileSize?: number;
  }): Result<Credential, InvalidCredentialFormatError | CredentialSizeExceededError> {
    if (props.fileType !== ".pdf") {
      return Result.fail(new InvalidCredentialFormatError(props.fileType));
    }

    if (
      props.fileSize &&
      props.fileSize > Credential.MAX_SIZE_BYTES
    ) {
      return Result.fail(new CredentialSizeExceededError(props.fileSize));
    }

    return Result.ok(new Credential(props));
  }

  toValue(): CredentialValue {
    return this.value;
  }
}

type CredentialValue = {
  fileType: string;
  fileSize?: number;
};

export class InvalidCredentialFormatError extends DomainError {
  readonly code = "INVALID_CREDENTIAL_FORMAT";
  constructor(fileType: string) {
    super("Credential must be in PDF format", { fileType });
    this.name = this.constructor.name;
  }
}

export class CredentialSizeExceededError extends DomainError {
  readonly code = "CREDENTIAL_SIZE_EXCEEDED";
  constructor(fileSize: number) {
    super("Credential file size exceeds 10MB limit", { fileSize });
    this.name = this.constructor.name;
  }
}
