import { Result } from "@shared/infrastructure/Result.js";
import Firstname from "../value-objects/Firstname.js";
import Lastname from "../value-objects/Lastname.js";
import HelperEmail from "../value-objects/HelperEmail.js";

export interface UserProps {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
}

export default class User {
  readonly id: string;
  readonly email: HelperEmail;
  readonly firstname: Firstname;
  readonly lastname: Lastname;

  private constructor(props: {
    id: string;
    email: HelperEmail;
    firstname: Firstname;
    lastname: Lastname;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.firstname = props.firstname;
    this.lastname = props.lastname;
  }

  static create(props: UserProps): Result<User, Error> {
    const guard = Result.combineObject({
      email: HelperEmail.create(props.email),
      firstname: Firstname.create(props.firstname),
      lastname: Lastname.create(props.lastname),
    });

    if (Result.isFailure(guard)) {
      return guard;
    }

    return Result.ok(
      new User({
        id: props.id,
        email: guard.value.email,
        firstname: guard.value.firstname,
        lastname: guard.value.lastname,
      })
    );
  }

  toObject(): UserProps {
    return {
      id: this.id,
      email: this.email.toValue(),
      firstname: this.firstname.toValue(),
      lastname: this.lastname.toValue(),
    };
  }
}
