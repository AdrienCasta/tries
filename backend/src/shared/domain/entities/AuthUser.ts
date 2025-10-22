export interface AuthUserRead {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  emailConfirmed: boolean;
}
export interface AuthUserWrite {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
}
