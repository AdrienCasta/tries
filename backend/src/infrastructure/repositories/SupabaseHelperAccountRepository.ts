import { SupabaseClient } from "@supabase/supabase-js";
import { HelperAccount } from "../../domain/entities/HelperAccount.js";
import { HelperAccountRepository } from "../../domain/repositories/HelperAccountRepository.js";
import HelperId from "../../domain/value-objects/HelperId.js";
import { Result } from "../../shared/Result.js";
import InfraError from "../../domain/errors/InfraError.js";

export default class CreateHelperAccountError extends InfraError {
  readonly code = "CreateHelperAccountError";

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class SupabaseHelperAccountRepository
  implements HelperAccountRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async create(
    account: HelperAccount
  ): Promise<Result<HelperAccount, InfraError>> {
    const { error } = await this.supabase.auth.admin.createUser({
      email: account.email.value,
      password: account.password?.value,
      email_confirm: false,
    });

    return error
      ? Result.fail(new CreateHelperAccountError(error.message))
      : Result.ok(account);
  }

  async findByHelperId(id: HelperId) {
    const { data, error } = await this.supabase.auth.admin.getUserById(
      id.value
    );

    return data.user;
  }
}
