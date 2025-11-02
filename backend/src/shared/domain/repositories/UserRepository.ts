import User, { UserProps } from "../entities/User.js";
import { Result } from "../../infrastructure/Result.js";

export interface UserWrite {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
}

export default interface UserRepository {
  create(user: UserWrite): Promise<Result<void, Error>>;
  findByEmail(email: string): Promise<UserProps | null>;
  findById(id: string): Promise<UserProps | null>;
}
