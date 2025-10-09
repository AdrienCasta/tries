import HelperEmail from "../../domain/value-objects/HelperEmail.js";

export class EmailFixtures {
  static aRandomEmail(): string {
    const randomString = Math.random().toString(36).substring(2, 15);
    const domains = ["example.com", "test.com", "domain.com", "email.com"];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];

    const email = `${randomString}@${randomDomain}`;

    const result = HelperEmail.create(email);

    if (!result.success) {
      throw new Error(`Generated invalid email: ${email}`);
    }

    return result.value.toValue();
  }
}
