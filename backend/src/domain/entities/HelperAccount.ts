import HelperId from "../value-objects/HelperId.js";
import HelperEmail from "../value-objects/HelperEmail.js";
import Password from "../value-objects/Password.js";
import PasswordSetupToken from "../value-objects/PasswordSetupToken.js";

export type HelperAccount = {
  helperId: HelperId;
  email: HelperEmail;
  password?: Password;
  passwordSetupToken?: PasswordSetupToken;
  passwordSetAt?: Date;
  createdAt: Date;
  lastLoginAt?: Date;
};
