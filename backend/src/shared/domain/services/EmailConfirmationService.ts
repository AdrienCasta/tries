import { Result } from "@shared/infrastructure/Result.js";
import {
  InvalidTokenFormatError,
  TokenExpiredError,
  EmailAlreadyConfirmedError,
} from "../../../features/confirm-helper-email/ConfirmHelperEmail.errors.js";

export interface EmailConfirmationService {
  confirmEmail(token: string): Promise<Result<void, Error>>;
}
