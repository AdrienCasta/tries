export class HelperNotFoundError extends Error {
  readonly code = "HELPER_NOT_FOUND";
  constructor() {
    super("Helper not found");
  }
}
