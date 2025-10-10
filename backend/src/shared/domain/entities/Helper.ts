import HelperEmail from "../value-objects/HelperEmail.js";
import HelperId from "../value-objects/HelperId.js";
import Firstname from "../value-objects/Firstname.js";
import Lastname from "../value-objects/Lastname.js";
import Profession from "../value-objects/Profession.js";
import Birthdate from "../value-objects/Birthdate.js";
import FrenchCounty from "../value-objects/FrenchCounty.js";

export type Helper = {
  id: HelperId;
  email: HelperEmail;
  lastname: Lastname;
  firstname: Firstname;
  birthdate: Birthdate;
  professions: Profession[];
  frenchCounty: FrenchCounty;
  placeOfBirth: PlaceOfBirth;
};
