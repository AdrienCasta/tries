export class PhoneNumberFixtures {
  static aRandomMobileNumber(): string {
    const prefix = Math.random() < 0.5 ? "6" : "7";

    const randomDigits = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    return `+33${prefix}${randomDigits}`;
  }
}
