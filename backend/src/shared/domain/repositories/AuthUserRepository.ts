import { AuthUserRead, AuthUserWrite } from "../entities/AuthUser";

export default interface AuthUserRepository {
  createUser(authUser: AuthUserWrite): Promise<void>;
  getUserByEmail(email: string): Promise<AuthUserRead | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByPhoneNumber(phoneNumber: string): Promise<boolean>;
}
