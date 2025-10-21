import { Result } from "../../infrastructure/Result.js";
import { AuthUser } from "../entities/AuthUser.js";
import HelperId from "../value-objects/HelperId.js";
import InviteAuthUserException from "../../infrastructure/InviteAuthUserException.js";
import EmailAlreadyUsedError from "../../infrastructure/EmailAlreadyUsedError.js";
import PhoneAlreadyUsedError from "../../infrastructure/PhoneAlreadyUsedError.js";

export interface AuthRepository {
  inviteUser(
    account: AuthUser
  ): Promise<
    Result<
      AuthUser,
      InviteAuthUserException | EmailAlreadyUsedError | PhoneAlreadyUsedError
    >
  >;
  delete(helperId: HelperId): Promise<void>;
  findByHelperId(helperId: HelperId): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
  findByPhone(phone: string): Promise<AuthUser | null>;
}
