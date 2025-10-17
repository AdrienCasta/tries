import { describe, it, expect } from "vitest";
import Residence from "../domain/value-objects/Residence.js";
import { Result } from "../infrastructure/Result.js";

describe("Residence", () => {
  describe("createFrenchResidence", () => {
    it("should create a valid French residence with valid french county", () => {
      const result = Residence.createFrenchResidence("75");

      expect(Result.isSuccess(result)).toBe(true);
      if (Result.isSuccess(result)) {
        expect(result.value.toValue()).toEqual({
          country: "France",
          frenchCounty: "75",
        });
      }
    });

    it("should create a valid French residence with default country France", () => {
      const result = Residence.createFrenchResidence("44");

      expect(Result.isSuccess(result)).toBe(true);
      if (Result.isSuccess(result)) {
        expect(result.value.toValue().country).toBe("France");
      }
    });

    it("should fail with invalid french county", () => {
      const result = Residence.createFrenchResidence("99");

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.code).toBe("RESIDENCE_INVALID");
      }
    });

    it("should fail with empty french county", () => {
      const result = Residence.createFrenchResidence("");

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.code).toBe("RESIDENCE_INVALID");
      }
    });

    it("should handle various valid french counties", () => {
      const validCounties = ["01", "2A", "2B", "75", "971", "974", "976"];

      validCounties.forEach((county) => {
        const result = Residence.createFrenchResidence(county);

        expect(Result.isSuccess(result)).toBe(true);
      });
    });

  });

  describe("createForeignResidence", () => {
    it("should create residence for Belgium without french county", () => {
      const result = Residence.createForeignResidence("Belgium");

      expect(Result.isSuccess(result)).toBe(true);
      if (Result.isSuccess(result)) {
        expect(result.value.toValue()).toEqual({
          country: "Belgium",
          frenchCounty: "",
        });
      }
    });

    it("should create residence for Germany without french county", () => {
      const result = Residence.createForeignResidence("Germany");

      expect(Result.isSuccess(result)).toBe(true);
      if (Result.isSuccess(result)) {
        expect(result.value.toValue().country).toBe("Germany");
      }
    });

    it("should create residence for Switzerland without french county", () => {
      const result = Residence.createForeignResidence("Switzerland");

      expect(Result.isSuccess(result)).toBe(true);
    });

    it("should create residence for Spain without french county", () => {
      const result = Residence.createForeignResidence("Spain");

      expect(Result.isSuccess(result)).toBe(true);
    });

    it("should create residence for Italy without french county", () => {
      const result = Residence.createForeignResidence("Italy");

      expect(Result.isSuccess(result)).toBe(true);
    });

    it("should reject France when using foreign residence factory", () => {
      const result = Residence.createForeignResidence("France");

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.code).toBe("RESIDENCE_INVALID");
      }
    });

    it("should reject unsupported country", () => {
      const result = Residence.createForeignResidence("Canada");

      expect(Result.isFailure(result)).toBe(true);
      if (Result.isFailure(result)) {
        expect(result.error.code).toBe("RESIDENCE_INVALID");
      }
    });
  });

});
