import User, { UserProps, ProfileStatus } from "../entities/User.js";
import { Result } from "../../infrastructure/Result.js";

export interface UserWrite {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  profileStatus?: ProfileStatus;
}

export interface UserUpdate {
  id: string;
  firstname?: string;
  lastname?: string;
  profileStatus?: ProfileStatus;
}

export default interface UserRepository {
  create(user: UserWrite): Promise<Result<void, Error>>;
  update(user: UserUpdate): Promise<Result<void, Error>>;
  findByEmail(email: string): Promise<UserProps | null>;
  findById(id: string): Promise<UserProps | null>;
}
