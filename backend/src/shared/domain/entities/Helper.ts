import HelperEmail from "../value-objects/HelperEmail.js";
import HelperId from "../value-objects/HelperId.js";
import Firstname from "../value-objects/Firstname.js";
import Lastname from "../value-objects/Lastname.js";
import Profession from "../value-objects/Profession.js";
import Birthdate from "../value-objects/Birthdate.js";
import Residence from "../value-objects/Residence.js";
import PlaceOfBirth from "../value-objects/PlaceOfBirth.js";

export type HelperProps = {
  id: HelperId;
  email: HelperEmail;
  lastname: Lastname;
  firstname: Firstname;
  birthdate: Birthdate;
  professions: Profession[];
  residence: Residence;
  placeOfBirth: PlaceOfBirth;
};

export class Helper {
  id: HelperId;
  email: HelperEmail;
  lastname: Lastname;
  firstname: Firstname;
  birthdate: Birthdate;
  professions: Profession[];
  residence: Residence;
  placeOfBirth: PlaceOfBirth;
  status: "pending_review" | "incomplete";

  private constructor({
    id,
    email,
    lastname,
    firstname,
    birthdate,
    professions,
    residence,
    placeOfBirth,
    status,
  }: HelperProps & { status: "pending_review" | "incomplete" }) {
    this.id = id;
    this.email = email;
    this.lastname = lastname;
    this.firstname = firstname;
    this.birthdate = birthdate;
    this.professions = professions;
    this.residence = residence;
    this.placeOfBirth = placeOfBirth;
    this.status = status;
  }

  static inPendingReview(props: HelperProps) {
    return new this({ ...props, status: "pending_review" });
  }

  static asIncomplete(props: HelperProps) {
    return new this({ ...props, status: "incomplete" });
  }

  isIncomplete() {
    return this.status === "incomplete";
  }

  isPendingReview() {
    return this.status === "pending_review";
  }
}
