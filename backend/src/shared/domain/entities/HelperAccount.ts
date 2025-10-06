import HelperId from "../value-objects/HelperId.js";
import HelperEmail from "../value-objects/HelperEmail.js";
import Password from "../value-objects/Password.js";
import PhoneNumber from "../value-objects/PhoneNumber.js";

export type HelperAccount = {
  helperId: HelperId;
  email: HelperEmail;
  password?: Password;
  passwordSetAt?: Date;
  createdAt: Date;
  lastLoginAt?: Date;
  phoneNumber?: PhoneNumber | null;
};
