export type HelperForValidation = {
  email: string;
  firstname?: string;
  lastname?: string;
  emailConfirmed: boolean;
  credentialsSubmitted: boolean;
  backgroundCheckSubmitted: boolean;
  profileValidated: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  underReview?: boolean;
};
