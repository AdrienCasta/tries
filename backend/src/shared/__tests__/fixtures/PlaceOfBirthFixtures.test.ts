import { describe, it, expect } from "vitest";
import { PlaceOfBirthFixtures, countryCodes } from "./PlaceOfBirthFixtures.js";
import PlaceOfBirth from "../../domain/value-objects/PlaceOfBirth.js";

describe.skip("PlaceOfBirthFixtures", () => {
  describe("aRandomPlaceOfBirth", () => {
    it("generates valid place of birth structure", () => {
      const placeOfBirth = PlaceOfBirthFixtures.aRandomPlaceOfBirth();

      expect(placeOfBirth).toHaveProperty("country");
      expect(placeOfBirth).toHaveProperty("city");
      expect(placeOfBirth).toHaveProperty("zipCode");

      expect(typeof placeOfBirth.country).toBe("string");
      expect(typeof placeOfBirth.city).toBe("string");
      expect(typeof placeOfBirth.zipCode).toBe("string");
    });

    it("generates country from valid country codes", () => {
      const placeOfBirth = PlaceOfBirthFixtures.aRandomPlaceOfBirth();

      expect(countryCodes).toContain(placeOfBirth.country);
    });

    it("generates city that belongs to the country", () => {
      const placeOfBirth = PlaceOfBirthFixtures.aRandomPlaceOfBirth();

      const citiesForCountry =
        PlaceOfBirthFixtures.CITIES_DATABASE[
          placeOfBirth.country as keyof typeof PlaceOfBirthFixtures.CITIES_DATABASE
        ];

      const cityExists = citiesForCountry.some(
        (c) => c.city === placeOfBirth.city
      );
      expect(cityExists).toBe(true);
    });

    it("generates zipCode that matches the city", () => {
      const placeOfBirth = PlaceOfBirthFixtures.aRandomPlaceOfBirth();

      const citiesForCountry =
        PlaceOfBirthFixtures.CITIES_DATABASE[
          placeOfBirth.country as keyof typeof PlaceOfBirthFixtures.CITIES_DATABASE
        ];

      const matchingCity = citiesForCountry.find(
        (c) => c.city === placeOfBirth.city
      );

      expect(matchingCity?.zipCode).toBe(placeOfBirth.zipCode);
    });

    it("generates data that passes PlaceOfBirth.create validation", () => {
      const placeOfBirth = PlaceOfBirthFixtures.aRandomPlaceOfBirth();

      const result = PlaceOfBirth.create(placeOfBirth);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.toValue()).toEqual(placeOfBirth);
      }
    });

    it("generates different values on multiple calls", () => {
      const results = new Set();

      for (let i = 0; i < 20; i++) {
        const placeOfBirth = PlaceOfBirthFixtures.aRandomPlaceOfBirth();
        results.add(JSON.stringify(placeOfBirth));
      }

      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe("withCountry", () => {
    it("generates place of birth for specified country", () => {
      const placeOfBirth = PlaceOfBirthFixtures.withCountry("FR");

      expect(placeOfBirth.country).toBe("FR");
      expect(placeOfBirth.city).toBeDefined();
      expect(placeOfBirth.zipCode).toBeDefined();
    });

    it("generates city that belongs to the specified country", () => {
      const placeOfBirth = PlaceOfBirthFixtures.withCountry("US");

      const citiesForCountry = PlaceOfBirthFixtures.CITIES_DATABASE.US;
      const cityExists = citiesForCountry.some(
        (c) => c.city === placeOfBirth.city
      );

      expect(cityExists).toBe(true);
    });
  });

  describe("withCity", () => {
    it("generates place of birth for specified city", () => {
      const placeOfBirth = PlaceOfBirthFixtures.withCity("FR", "Paris");

      expect(placeOfBirth.country).toBe("FR");
      expect(placeOfBirth.city).toBe("Paris");
      expect(placeOfBirth.zipCode).toBe("75001");
    });

    it("throws error for invalid city", () => {
      expect(() => {
        PlaceOfBirthFixtures.withCity("FR", "InvalidCity");
      }).toThrow("City InvalidCity not found for country FR");
    });
  });
});
