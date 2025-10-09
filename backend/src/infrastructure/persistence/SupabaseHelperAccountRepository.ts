import { SupabaseClient } from "@supabase/supabase-js";
import { HelperAccount } from "@shared/domain/entities/HelperAccount.js";
import { HelperAccountRepository } from "@shared/domain/repositories/HelperAccountRepository.js";
import HelperId from "@shared/domain/value-objects/HelperId.js";
import { Result } from "@shared/infrastructure/Result.js";
import CreateHelperAccountException from "@shared/infrastructure/CreateHelperAccountException.js";
import { HelperAccountPersistenceMapper } from "./mappers/HelperAccountPersistenceMapper.js";

export class SupabaseHelperAccountRepository
  implements HelperAccountRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async create(
    account: HelperAccount
  ): Promise<Result<HelperAccount, CreateHelperAccountException>> {
    const persistenceModel =
      HelperAccountPersistenceMapper.toPersistence(account);
    const { error } = await this.supabase.auth.admin.createUser(
      persistenceModel
    );

    return error
      ? Result.fail(new CreateHelperAccountException(error.message))
      : Result.ok(account);
  }

  async findByHelperId(id: HelperId): Promise<HelperAccount | null> {
    const { data, error } = await this.supabase.auth.admin.getUserById(
      id.value
    );

    if (error || !data.user) {
      return null;
    }

    return HelperAccountPersistenceMapper.toDomain(data.user as any);
  }

  async findByEmail(email: string): Promise<HelperAccount | null> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error || !data.users) {
      return null;
    }

    const user = data.users.find((u) => u.email === email);
    if (!user) {
      return null;
    }

    return HelperAccountPersistenceMapper.toDomain(user as any);
  }
  async findByPhone(phoneNumber: string): Promise<HelperAccount | null> {
    const { data, error } = await this.supabase.auth.admin.listUsers();

    if (error || !data.users) {
      return null;
    }

    const normalizedSearchPhone = phoneNumber.replace(/^\+/, "");

    const user = data.users.find((u) => {
      if (!u.phone) return false;
      const normalizedUserPhone = u.phone.replace(/^\+/, "");
      return normalizedUserPhone === normalizedSearchPhone;
    });

    if (!user) {
      return null;
    }

    return HelperAccountPersistenceMapper.toDomain(user as any);
  }
}
