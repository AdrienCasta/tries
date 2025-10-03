import { SupabaseClient } from "@supabase/supabase-js";
import { HelperAccount } from "../../domain/entities/HelperAccount.js";
import { HelperAccountRepository } from "../../domain/repositories/HelperAccountRepository.js";
import HelperId from "../../domain/value-objects/HelperId.js";
import HelperEmail from "../../domain/value-objects/HelperEmail.js";
import Password from "../../domain/value-objects/Password.js";
import PasswordSetupToken from "../../domain/value-objects/PasswordSetupToken.js";

const USER_METADATA_FIELDS = {
  PASSWORD_SETUP_TOKEN: "password_setup_token",
  PASSWORD_SETUP_TOKEN_EXPIRES_AT: "password_setup_token_expires_at",
  PASSWORD_SET_AT: "password_set_at",
} as const;

export class SupabaseHelperAccountRepository
  implements HelperAccountRepository
{
  constructor(private readonly supabase: SupabaseClient) {}

  async save(account: HelperAccount): Promise<void> {
    const { data: existingUser } = await this.supabase.auth.admin.listUsers();
    const user = existingUser?.users.find(
      (u) => u.email === account.email.value
    );

    if (user) {
      await this.updateUser(user.id, account);
    } else {
      await this.createUser(account);
    }
  }

  private async createUser(account: HelperAccount): Promise<void> {
    const userMetadata = this.buildUserMetadata(account);

    const createData: any = {
      email: account.email.value,
      user_metadata: userMetadata,
      email_confirm: false,
      id: account.helperId.value,
    };

    if (account.password) {
      createData.password = account.password.toString();
    }

    const { error } = await this.supabase.auth.admin.createUser(createData);

    if (error) {
      throw new Error(`Failed to create user in Supabase Auth: ${error.message}`);
    }
  }

  private async updateUser(userId: string, account: HelperAccount): Promise<void> {
    const userMetadata = this.buildUserMetadata(account);

    const updates: any = {
      user_metadata: userMetadata,
    };

    if (account.password) {
      updates.password = account.password.toString();
    }

    const { error } = await this.supabase.auth.admin.updateUserById(
      userId,
      updates
    );

    if (error) {
      throw new Error(`Failed to update user in Supabase Auth: ${error.message}`);
    }
  }

  private buildUserMetadata(account: HelperAccount): Record<string, any> {
    const metadata: Record<string, any> = {};

    if (account.passwordSetupToken) {
      metadata[USER_METADATA_FIELDS.PASSWORD_SETUP_TOKEN] =
        account.passwordSetupToken.value;
      metadata[USER_METADATA_FIELDS.PASSWORD_SETUP_TOKEN_EXPIRES_AT] =
        account.passwordSetupToken.expiration.toISOString();
    } else {
      metadata[USER_METADATA_FIELDS.PASSWORD_SETUP_TOKEN] = null;
      metadata[USER_METADATA_FIELDS.PASSWORD_SETUP_TOKEN_EXPIRES_AT] = null;
    }

    return metadata;
  }

  async findByHelperId(helperId: HelperId): Promise<HelperAccount | null> {
    const { data } = await this.supabase.auth.admin.listUsers();

    if (!data?.users) {
      return null;
    }

    const user = data.users.find(
      (u) => u.user_metadata?.helper_id === helperId.value
    );

    if (!user) {
      return null;
    }

    return this.mapToHelperAccount(user);
  }

  async findByEmail(email: string): Promise<HelperAccount | null> {
    const { data } = await this.supabase.auth.admin.listUsers();

    if (!data?.users) {
      return null;
    }

    const user = data.users.find((u) => u.email === email);

    if (!user) {
      return null;
    }

    return this.mapToHelperAccount(user);
  }

  async findByPasswordSetupToken(
    token: string
  ): Promise<HelperAccount | null> {
    const { data } = await this.supabase.auth.admin.listUsers();

    if (!data?.users) {
      return null;
    }

    const user = data.users.find(
      (u) => u.user_metadata?.password_setup_token === token
    );

    if (!user) {
      return null;
    }

    return this.mapToHelperAccount(user);
  }

  private mapToHelperAccount(user: any): HelperAccount {
    const emailResult = HelperEmail.create(user.email);
    if (!emailResult.success) {
      throw new Error(`Invalid email from Supabase Auth: ${user.email}`);
    }

    // Use Supabase's UUID as the helper ID
    const helperId = HelperId.create(user.id);

    let password: Password | undefined;
    if (user.encrypted_password) {
      password = Password.fromHash(user.encrypted_password);
    }

    let passwordSetupToken: PasswordSetupToken | undefined;
    const tokenValue = user.user_metadata?.[USER_METADATA_FIELDS.PASSWORD_SETUP_TOKEN];
    const tokenExpires = user.user_metadata?.[USER_METADATA_FIELDS.PASSWORD_SETUP_TOKEN_EXPIRES_AT];

    if (tokenValue && tokenExpires) {
      passwordSetupToken = PasswordSetupToken.fromValues(
        tokenValue,
        new Date(tokenExpires)
      );
    }

    return {
      helperId,
      email: emailResult.value,
      password,
      passwordSetupToken,
      passwordSetAt: user.user_metadata?.[USER_METADATA_FIELDS.PASSWORD_SET_AT]
        ? new Date(user.user_metadata[USER_METADATA_FIELDS.PASSWORD_SET_AT])
        : undefined,
      createdAt: new Date(user.created_at),
      lastLoginAt: user.last_sign_in_at
        ? new Date(user.last_sign_in_at)
        : undefined,
    };
  }
}
