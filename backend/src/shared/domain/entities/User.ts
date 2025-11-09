import { Result } from "@shared/infrastructure/Result.js";
import Firstname from "../value-objects/Firstname.js";
import Lastname from "../value-objects/Lastname.js";
import HelperEmail from "../value-objects/HelperEmail.js";

export type ProfileStatus = "incomplete" | "completed";

export interface UserProps {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  profileStatus?: ProfileStatus;
}

export default class User {
  readonly id: string;
  readonly email: HelperEmail;
  readonly firstname?: Firstname;
  readonly lastname?: Lastname;
  readonly profileStatus: ProfileStatus;

  private constructor(props: {
    id: string;
    email: HelperEmail;
    firstname?: Firstname;
    lastname?: Lastname;
    profileStatus: ProfileStatus;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.firstname = props.firstname;
    this.lastname = props.lastname;
    this.profileStatus = props.profileStatus;
  }

  static create(props: UserProps): Result<User, Error> {
    const emailResult = HelperEmail.create(props.email);
    if (Result.isFailure(emailResult)) {
      return emailResult;
    }

    let firstname: Firstname | undefined;
    let lastname: Lastname | undefined;

    if (props.firstname) {
      const firstnameResult = Firstname.create(props.firstname);
      if (Result.isFailure(firstnameResult)) {
        return firstnameResult;
      }
      firstname = firstnameResult.value;
    }

    if (props.lastname) {
      const lastnameResult = Lastname.create(props.lastname);
      if (Result.isFailure(lastnameResult)) {
        return lastnameResult;
      }
      lastname = lastnameResult.value;
    }

    return Result.ok(
      new User({
        id: props.id,
        email: emailResult.value,
        firstname,
        lastname,
        profileStatus: props.profileStatus ?? "incomplete",
      })
    );
  }

  toObject(): UserProps {
    return {
      id: this.id,
      email: this.email.toValue(),
      firstname: this.firstname?.toValue(),
      lastname: this.lastname?.toValue(),
      profileStatus: this.profileStatus,
    };
  }
}
