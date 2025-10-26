import { AuthUserRead, AuthUserWrite } from "@shared/domain/entities/AuthUser";
import AuthUserRepository from "@shared/domain/repositories/AuthUserRepository";
import crypto from "node:crypto";

export default class InMemoryAuthUserRepository implements AuthUserRepository {
  authUsers: Map<string, AuthUserRead> = new Map();

  async createUser(authUser: AuthUserWrite): Promise<void> {
    this.authUsers.set(authUser.email, {
      ...authUser,
      id: crypto.randomUUID(),
      emailConfirmed: false,
    });
  }

  async getUserByEmail(email: string): Promise<AuthUserRead | null> {
    return this.authUsers.get(email) || null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.authUsers.has(email);
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    for (const user of this.authUsers.values()) {
      if (user.phoneNumber === phoneNumber) {
        return true;
      }
    }
    return false;
  }
}
