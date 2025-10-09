import { describe, it, expect } from "vitest";
import { PhoneNumberFixtures } from "./PhoneNumberFixtures.js";
import PhoneNumber from "../../domain/value-objects/PhoneNumber.js";

describe("PhoneNumberFixtures", () => {
  describe("aRandomMobileNumber", () => {
    it("generates valid international format by default", () => {
      const phoneNumber = PhoneNumberFixtures.aRandomMobileNumber();

      expect(phoneNumber).toMatch(/^\+33[67]\d{8}$/);
    });

    it("generates numbers starting with 06 or 07", () => {
      const numbers = Array.from({ length: 20 }, () =>
        PhoneNumberFixtures.aRandomMobileNumber()
      );

      const allStartWithValidPrefix = numbers.every(
        (num) => num.startsWith("+336") || num.startsWith("+337")
      );

      expect(allStartWithValidPrefix).toBe(true);
    });
  });
});
