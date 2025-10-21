import HelperEmail from "../value-objects/HelperEmail.js";
import PhoneNumber from "../value-objects/PhoneNumber.js";

export type AuthUser = {
  email: HelperEmail;
  phoneNumber?: PhoneNumber | null;
};
