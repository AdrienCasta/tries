import InfraException from "./InfraException.js";

export default class CreateHelperAccountException extends InfraException {
  readonly code = "CreateHelperAccountException";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
