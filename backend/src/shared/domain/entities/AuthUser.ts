export interface AuthUserRead {
  id: string;
  email: string;
  emailConfirmed: boolean;
}
export interface AuthUserWrite {
  email: string;
  password: string;
}
