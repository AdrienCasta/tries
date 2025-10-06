import InfraException from "./InfraException.js";

export default class DataMappingException extends InfraException {
  readonly code = "DATA_MAPPING_ERROR";

  constructor(
    message: string,
    details?: {
      field?: string;
      rawValue?: unknown;
      validationError?: string;
      recordId?: string;
    }
  ) {
    super(message, details);
  }

  static forField(
    field: string,
    rawValue: unknown,
    validationError?: string
  ): DataMappingException {
    return new DataMappingException(
      `Failed to map field "${field}" from database`,
      {
        field,
        rawValue,
        validationError,
      }
    );
  }

  static forRecord(
    recordId: string,
    error: Error
  ): DataMappingException {
    return new DataMappingException(
      `Failed to map database record: ${error.message}`,
      {
        recordId,
        validationError: error.message,
      }
    );
  }
}
