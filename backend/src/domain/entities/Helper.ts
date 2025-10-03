import HelperEmail from "../value-objects/HelperEmail.js";
import HelperId from "../value-objects/HelperId.js";
import Firstname from "../value-objects/Firstname.js";
import Lastname from "../value-objects/Lastname.js";
import Password from "../value-objects/Password.js";
import PasswordSetupToken from "../value-objects/PasswordSetupToken.js";

export type Helper = {
  id: HelperId;
  email: HelperEmail;
  lastname: Lastname;
  firstname: Firstname;
  password?: Password;
  passwordSetupToken?: PasswordSetupToken;
  passwordSetAt?: Date;
};
