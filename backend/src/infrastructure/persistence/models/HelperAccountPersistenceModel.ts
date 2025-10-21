export type HelperAccountWriteModel = {
  email: string;
  phone?: string;
};

export type HelperAccountReadModel = {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
};
