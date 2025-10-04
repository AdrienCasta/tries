import { SupabaseClient } from "@supabase/supabase-js";
import { HelperAccount } from "../../shared/domain/entities/HelperAccount.js";
import { HelperAccountRepository } from "../../shared/domain/repositories/HelperAccountRepository.js";
import HelperId from "../../shared/domain/value-objects/HelperId.js";
import { Result } from "../../shared/infrastructure/Result.js";
import CreateHelperAccountException from "../../shared/infrastructure/CreateHelperAccountException.js";

export class SupabaseHelperAccountRepository
  implements HelperAccountRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async create(
    account: HelperAccount
  ): Promise<Result<HelperAccount, CreateHelperAccountException>> {
    const { error } = await this.supabase.auth.admin.createUser({
      email: account.email.value,
      password: account.password?.value,
      email_confirm: false,
    });

    return error
      ? Result.fail(new CreateHelperAccountException(error.message))
      : Result.ok(account);
  }

  async findByHelperId(id: HelperId) {
    const { data, error } = await this.supabase.auth.admin.getUserById(
      id.value
    );

    return data.user;
  }
}
