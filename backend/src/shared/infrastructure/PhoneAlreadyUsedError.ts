import InfrastrctureError from "./InfrastrctureError.js";

export default class PhoneAlreadyUsedError extends InfrastrctureError {
  readonly code = "PHONE_NUMBER_ALREADY_IN_USE";

  constructor(phoneNumber: string) {
    super("This phone number is already in use.", { phoneNumber });
  }
}
