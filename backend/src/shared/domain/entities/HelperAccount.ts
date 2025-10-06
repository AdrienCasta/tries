import HelperId from "../value-objects/HelperId.js";
import HelperEmail from "../value-objects/HelperEmail.js";
import Password from "../value-objects/Password.js";

export type HelperAccount = {
  helperId: HelperId;
  email: HelperEmail;
  password?: Password;
  passwordSetAt?: Date;
  createdAt: Date;
  lastLoginAt?: Date;
};
