import { Result } from "../../infrastructure/Result.js";
import DomainError from "@shared/domain/DomainError.js";

export default class CriminalRecordCertificate {
  private static readonly MAX_SIZE_BYTES = 10 * 1024 * 1024;
  readonly value: CriminalRecordCertificateValue;

  private constructor(value: CriminalRecordCertificateValue) {
    this.value = value;
  }

  static create(props: {
    fileType: string;
    fileSize?: number;
  }): Result<
    CriminalRecordCertificate,
    | InvalidCriminalRecordCertificateFormatError
    | CriminalRecordCertificateSizeExceededError
    | EmptyCriminalRecordCertificateFileError
  > {
    if (props.fileType !== ".pdf") {
      return Result.fail(
        new InvalidCriminalRecordCertificateFormatError(props.fileType)
      );
    }

    if (props.fileSize !== undefined && props.fileSize === 0) {
      return Result.fail(new EmptyCriminalRecordCertificateFileError());
    }

    if (
      props.fileSize &&
      props.fileSize > CriminalRecordCertificate.MAX_SIZE_BYTES
    ) {
      return Result.fail(
        new CriminalRecordCertificateSizeExceededError(props.fileSize)
      );
    }

    return Result.ok(new CriminalRecordCertificate(props));
  }

  toValue(): CriminalRecordCertificateValue {
    return this.value;
  }
}

type CriminalRecordCertificateValue = {
  fileType: string;
  fileSize?: number;
};

export class InvalidCriminalRecordCertificateFormatError extends DomainError {
  readonly code = "INVALID_CRIMINAL_RECORD_CERTIFICATE_FORMAT";
  constructor(fileType: string) {
    super("Criminal record certificate must be in PDF format", { fileType });
    this.name = this.constructor.name;
  }
}

export class CriminalRecordCertificateSizeExceededError extends DomainError {
  readonly code = "CRIMINAL_RECORD_CERTIFICATE_SIZE_EXCEEDED";
  constructor(fileSize: number) {
    super("Criminal record certificate file size exceeds 10MB limit", {
      fileSize,
    });
    this.name = this.constructor.name;
  }
}

export class EmptyCriminalRecordCertificateFileError extends DomainError {
  readonly code = "EMPTY_CRIMINAL_RECORD_CERTIFICATE_FILE";
  constructor() {
    super("Criminal record certificate file is empty");
    this.name = this.constructor.name;
  }
}
