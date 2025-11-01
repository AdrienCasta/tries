const countryCodes = [
  "US",
  "CA",
  "MX",
  "GB",
  "FR",
  "DE",
  "JP",
  "AU",
  "BR",
  "CN",
] as const;

type CountryCode = (typeof countryCodes)[number];

interface CityEntry {
  city: string;
  zipCode: string;
}

type CitiesDatabase = Record<CountryCode, CityEntry[]>;

class RandomHelper {
  static pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

export class PlaceOfBirthFixtures {
  static CITIES_DATABASE: CitiesDatabase = {
    US: [
      {
        city: "New York",
        zipCode: "10001",
      },
      {
        city: "Los Angeles",
        zipCode: "90001",
      },
      {
        city: "Chicago",
        zipCode: "60601",
      },
    ],
    CA: [
      {
        city: "Toronto",
        zipCode: "M5A 1A1",
      },
      {
        city: "Montreal",
        zipCode: "H2Y 1E2",
      },
      {
        city: "Vancouver",
        zipCode: "V6B 1A1",
      },
    ],
    GB: [
      {
        city: "London",
        zipCode: "SW1A 0AA",
      },
      {
        city: "Manchester",
        zipCode: "M1 1AE",
      },
      {
        city: "Birmingham",
        zipCode: "B1 1AE",
      },
    ],
    FR: [
      {
        city: "Paris",
        zipCode: "75001",
      },
      {
        city: "Marseille",
        zipCode: "13001",
      },
      {
        city: "Lyon",
        zipCode: "69001",
      },
    ],
    DE: [
      {
        city: "Berlin",
        zipCode: "10115",
      },
      {
        city: "Munich",
        zipCode: "80331",
      },
      {
        city: "Hamburg",
        zipCode: "20095",
      },
    ],
    AU: [
      {
        city: "Sydney",
        zipCode: "2000",
      },
      {
        city: "Melbourne",
        zipCode: "3000",
      },
      {
        city: "Brisbane",
        zipCode: "4000",
      },
    ],
    MX: [
      {
        city: "Mexico City",
        zipCode: "01000",
      },
      {
        city: "Guadalajara",
        zipCode: "44100",
      },
      {
        city: "Monterrey",
        zipCode: "64000",
      },
    ],
    JP: [
      {
        city: "Tokyo",
        zipCode: "100-0001",
      },
      {
        city: "Kyoto",
        zipCode: "600-0001",
      },
      {
        city: "Osaka",
        zipCode: "530-0001",
      },
    ],
    BR: [
      {
        city: "São Paulo",
        zipCode: "01000-000",
      },
      {
        city: "Rio de Janeiro",
        zipCode: "20000-000",
      },
      {
        city: "Brasília",
        zipCode: "70000-000",
      },
    ],
    CN: [
      {
        city: "Beijing",
        zipCode: "100000",
      },
      {
        city: "Shanghai",
        zipCode: "200000",
      },
      {
        city: "Guangzhou",
        zipCode: "510000",
      },
    ],
  };

  static aRandomPlaceOfBirth() {
    //@ts-ignore
    const randomCountry = RandomHelper.pickRandom<CountryCode>(countryCodes);
    return this.withCountry(randomCountry);
  }

  static withCountry(country: CountryCode) {
    const citiesForCountry = this.CITIES_DATABASE[country];
    const cityEntry = RandomHelper.pickRandom(citiesForCountry);
    return this.buildPlaceOfBirth(country, cityEntry);
  }

  static withCity(country: CountryCode, city: string) {
    const citiesForCountry = this.CITIES_DATABASE[country];
    const cityEntry = citiesForCountry.find((c) => c.city === city);

    if (!cityEntry) {
      throw new Error(`City ${city} not found for country ${country}`);
    }

    return this.buildPlaceOfBirth(country, cityEntry);
  }

  private static buildPlaceOfBirth(country: CountryCode, cityEntry: CityEntry) {
    return {
      country,
      city: cityEntry.city,
      zipCode: cityEntry.zipCode,
    };
  }
}

export { countryCodes };
