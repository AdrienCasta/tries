export class InvalidTokenFormatError extends Error {
  readonly code = "INVALID_TOKEN_FORMAT";
  constructor() {
    super("Invalid token format");
  }
}

export class TokenExpiredError extends Error {
  readonly code = "TOKEN_EXPIRED";
  constructor() {
    super("Token has expired");
  }
}

export class EmailAlreadyConfirmedError extends Error {
  readonly code = "EMAIL_ALREADY_CONFIRMED";
  constructor() {
    super("Email is already confirmed");
  }
}
