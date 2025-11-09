import UserRepository, {
  UserWrite,
  UserUpdate,
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
      profileStatus: user.profileStatus ?? "incomplete",
    });
    return Result.ok();
  }

  async update(user: UserUpdate): Promise<Result<void, Error>> {
    const existingUser = this.users.get(user.id);

    if (!existingUser) {
      return Result.fail(new Error(`User with id ${user.id} not found`));
    }

    this.users.set(user.id, {
      ...existingUser,
      ...(user.firstname !== undefined && { firstname: user.firstname }),
      ...(user.lastname !== undefined && { lastname: user.lastname }),
      ...(user.profileStatus !== undefined && {
        profileStatus: user.profileStatus,
      }),
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
