import UserRepository, {
  UserWrite,
} from "@shared/domain/repositories/UserRepository.js";
import { UserProps } from "@shared/domain/entities/User.js";
import { Result } from "@shared/infrastructure/Result.js";

export default class InMemoryUserRepository implements UserRepository {
  private users: Map<string, UserProps> = new Map();

  async create(user: UserWrite): Promise<Result<void, Error>> {
    this.users.set(user.id, {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    });
    return Result.ok();
  }

  async findByEmail(email: string): Promise<UserProps | null> {
    const users = Array.from(this.users.values());
    return users.find((u) => u.email === email) || null;
  }

  async findById(id: string): Promise<UserProps | null> {
    return this.users.get(id) || null;
  }
}
