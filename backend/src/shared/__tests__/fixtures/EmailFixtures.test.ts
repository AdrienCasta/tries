import { describe, it, expect } from "vitest";
import { EmailFixtures } from "./EmailFixtures.js";
import HelperEmail from "../../domain/value-objects/HelperEmail.js";

describe("EmailFixtures", () => {
  describe("aRandomEmail", () => {
    it("generates valid email format", () => {
      const email = EmailFixtures.aRandomEmail();

      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it("generates emails that pass HelperEmail validation", () => {
      const email = EmailFixtures.aRandomEmail();

      const result = HelperEmail.create(email);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.toValue()).toBe(email);
      }
    });

    it("generates different emails on multiple calls", () => {
      const emails = Array.from({ length: 10 }, () =>
        EmailFixtures.aRandomEmail()
      );

      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBeGreaterThan(1);
    });

    it("generates emails with valid domain", () => {
      const validDomains = ["example.com", "test.com", "domain.com", "email.com"];
      const email = EmailFixtures.aRandomEmail();

      const hasValidDomain = validDomains.some((domain) =>
        email.endsWith(`@${domain}`)
      );

      expect(hasValidDomain).toBe(true);
    });

    it("generates emails with no whitespace", () => {
      const emails = Array.from({ length: 10 }, () =>
        EmailFixtures.aRandomEmail()
      );

      const allNoWhitespace = emails.every((email) => !/\s/.test(email));

      expect(allNoWhitespace).toBe(true);
    });
  });
});
