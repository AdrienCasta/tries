import InfrastrctureError from "./InfrastrctureError.js";

export default class SaveHelperError extends InfrastrctureError {
  readonly code = "SAVE_HELPER_FAILED";

  constructor(message: string) {
    super("Failed to save helper profile.", { message });
  }
}
