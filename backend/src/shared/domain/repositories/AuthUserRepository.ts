import { AuthUserWrite } from "../entities/AuthUser";

export default interface AuthUserRepository {
  createUser(authUser: AuthUserWrite): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhoneNumber(phoneNumber: string): Promise<boolean>;
}
