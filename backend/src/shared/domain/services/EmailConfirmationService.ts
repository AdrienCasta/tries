import { Result } from "@shared/infrastructure/Result.js";

export interface EmailConfirmationService {
  confirmEmail(token: string): Promise<Result<void, Error>>;
}
