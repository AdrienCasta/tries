export type HelperAccountWriteModel = {
  email: string;
  password?: string;
  phone?: string;
  email_confirm?: boolean;
};

export type HelperAccountReadModel = {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
};
