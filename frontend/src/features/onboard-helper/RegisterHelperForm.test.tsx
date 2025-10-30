import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BIRTH_COUNTRIES } from "../shared/constants/birthCountries";
import { RESIDENCE_COUNTRIES } from "../shared/constants/countries";
import { PROFESSIONS } from "../shared/constants/professions";
import RegisterHelperForm from "./RegisterHelperForm";

describe("Register helper successfully", () => {
  it("submits register form", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<RegisterHelperForm onSubmit={handleSubmit} />);
    await fillForm(user);
    const submitBtn = screen.getByRole("button", { name: /submit/i });

    await user.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalled();
  });
});

describe("Fail to register an helper", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let handleSubmit = vi.fn();

  beforeEach(() => {
    user = userEvent.setup();
    handleSubmit = vi.fn();
    render(<RegisterHelperForm onSubmit={handleSubmit} />);
  });

  afterEach(async () => {
    const submitBtn = screen.getByRole("button", { name: /submit/i });

    await user.click(submitBtn);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("knows a valid email is required to submit form", async () => {
    await fillForm(user, { email: "not-a-valid-email" });
  });
  it("knows email is required to submit form", async () => {
    await fillForm(user, { email: "" });
  });
  it("knows a valid firstname is required to submit form", async () => {
    await fillForm(user, { firstname: "" });
  });
  it("knows lastname is required to submit form", async () => {
    await fillForm(user, { lastname: "" });
  });
  it("knows a valid password is required to submit form", async () => {
    await fillForm(user, { password: "AZERT" });
  });
  it("knows a valid phone is required to submit form", async () => {
    await fillForm(user, { phoneNumber: "" });
  });
  it("knows birthdate is required to submit form", async () => {
    await fillForm(user, { birthdate: "" });
  });

  it("knows a valid birth country is required to submit form", async () => {
    await fillForm(user, {
      placeOfBirth: {
        country: undefined,
        city: "London",
      },
    });
  });

  it("knows a valid birth city is required to submit form", async () => {
    await fillForm(user, {
      placeOfBirth: {
        country: "FR",
        city: "",
      },
    });
  });
  it("knows a valid residence country is required to submit form", async () => {
    await fillForm(user, {
      residence: {
        country: undefined,
      },
    });
  });
  it("knows, as french resident, a valid french area code is required to submit form", async () => {
    await fillForm(user, {
      residence: {
        country: "FR",
        frenchAreaCode: "",
      },
    });
  });
  it("knows a bried description is required to submit form", async () => {
    await fillForm(user, {
      experienceSummary: "lorem ipsum",
    });
  });
  it("knows at least one profession is required to submit form", async () => {
    await fillForm(user, {
      professions: [],
    });
  });
  it("knows a valid RPPS number is required for each profession", async () => {
    await fillForm(user, {
      professions: ["physiotherapist"],
      rppsNumbers: {
        physiotherapist: "567",
      },
    });
  });
});

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides?: Partial<RegisterHelperCommand>
) {
  const typeEmail = async () => {
    const email = overrides?.email ?? "adrien@tries.fr";
    const element = screen.getByLabelText(/email/i);

    if (email === "") {
      await user.clear(element);
    } else {
      await user.type(element, email);
    }
  };

  const typeFirstname = async () => {
    const firstname = overrides?.firstname ?? "Adrien";
    const element = screen.getByLabelText(/first name/i);

    if (firstname === "") {
      await user.clear(element);
    } else {
      await user.type(element, firstname);
    }
  };

  const typeLastname = async () => {
    const lastname = overrides?.lastname ?? "Adrien";
    const element = screen.getByLabelText(/last name/i);

    if (lastname === "") {
      await user.clear(element);
    } else {
      await user.type(element, lastname);
    }
  };

  const typePassword = async () => {
    const password = overrides?.password ?? "P@ssw0rd!";
    const element = screen.getByLabelText(/password/i);

    if (password === "") {
      await user.clear(element);
    } else {
      await user.type(element, password);
    }
  };

  const typePhoneNumber = async () => {
    const phoneNumber = overrides?.phoneNumber ?? "0647048866";
    const element = screen.getByLabelText(/phone number/i);

    if (phoneNumber === "") {
      await user.clear(element);
    } else {
      await user.type(element, phoneNumber);
    }
  };

  const typeBirthdate = async () => {
    const birthdate = overrides?.birthdate ?? "1995-01-01";
    const element = screen.getByLabelText(/birthdate/i);

    if (birthdate === "") {
      await user.clear(element);
    } else {
      await user.type(element, birthdate);
    }
  };

  const selectPlaceOfBirthCountry = async () => {
    const countryCode = overrides?.placeOfBirth
      ? overrides.placeOfBirth.country
      : "FR";

    if (countryCode !== undefined) {
      const country = Object.values(BIRTH_COUNTRIES)
        .flat()
        .find((c) => c.code === countryCode);

      if (country) {
        const countrySelect = screen.getByLabelText(/country of birth/i);
        await user.click(countrySelect);
        await user.click(screen.getByRole("option", { name: country.label }));
      }
    }
  };

  const typePlaceOfBirthCity = async () => {
    const city = overrides?.placeOfBirth
      ? overrides.placeOfBirth.city
      : "Paris";
    const element = screen.getByLabelText(/city of birth/i);

    if (city === "") {
      await user.clear(element);
    } else {
      await user.type(element, city);
    }
  };

  const selectResidenceCountry = async () => {
    const countryCode = overrides?.residence
      ? overrides.residence.country
      : "FR";

    if (countryCode !== undefined) {
      const country = RESIDENCE_COUNTRIES.find((c) => c.code === countryCode);

      if (country) {
        const countrySelect = screen.getByLabelText(/current country/i);
        await user.click(countrySelect);
        await user.click(screen.getByRole("option", { name: country.label }));
      }
    }
  };

  const selectFrenchAreaCode = async () => {
    const residenceCountry = overrides?.residence?.country ?? "FR";
    const frenchAreaCode = overrides?.residence
      ? overrides.residence.frenchAreaCode
      : "01";

    if (
      residenceCountry === "FR" &&
      frenchAreaCode !== undefined &&
      frenchAreaCode !== ""
    ) {
      const areaCodeSelect = screen.getByLabelText(/french county/i);
      await user.click(areaCodeSelect);
      await user.click(screen.getByRole("option", { name: frenchAreaCode }));
    }
  };

  const typeExperienceSummary = async () => {
    const experienceSummary =
      overrides?.experienceSummary ??
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique, laborum exercitationem magnam adipisci esse enim expedita corporis doloremque consequatur laudantium dignissimos maiores ea mollitia quia, nostrum culpa magni! Magnam, ab.";
    const element = screen.getByLabelText(
      /relevant sports\/clinical experience/i
    );

    if (experienceSummary === "") {
      await user.clear(element);
    } else {
      await user.type(element, experienceSummary);
    }
  };

  const selectProfessions = async () => {
    const professions =
      overrides?.professions !== undefined
        ? overrides.professions
        : ["physiotherapist"];

    for (const professionCode of professions) {
      const profession = PROFESSIONS.find((p) => p.code === professionCode);
      if (profession) {
        const professionSelector = screen.getByTestId(
          "profession-selector-add"
        );
        await user.click(professionSelector);
        await user.click(
          screen.getByRole("option", { name: profession.label })
        );
      }
    }
  };

  const typeRppsNumbers = async () => {
    const professions =
      overrides?.professions !== undefined
        ? overrides.professions
        : ["physiotherapist"];
    const rppsNumbers = overrides?.rppsNumbers ?? {
      physiotherapist: "12345678901",
    };

    for (const professionCode of professions) {
      const profession = PROFESSIONS.find((p) => p.code === professionCode);
      if (profession) {
        const rppsNumber = rppsNumbers[professionCode];
        if (rppsNumber !== undefined) {
          const rppsInput = screen.getByLabelText(
            new RegExp(`rpps number for ${profession.label}`, "i")
          );
          if (rppsNumber === "") {
            await user.clear(rppsInput);
          } else {
            await user.type(rppsInput, rppsNumber);
          }
        }
      }
    }
  };

  await typeFirstname();
  await typeLastname();
  await typeEmail();
  await typePassword();
  await typePhoneNumber();
  await typeBirthdate();
  await selectPlaceOfBirthCountry();
  await typePlaceOfBirthCity();
  await selectProfessions();
  await typeRppsNumbers();
  await selectResidenceCountry();
  await selectFrenchAreaCode();
  await typeExperienceSummary();
}

export default interface RegisterHelperCommand {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthdate: string;
  placeOfBirth: {
    country: string;
    city: string;
  };
  professions: string[];
  rppsNumbers: Record<string, string>;
  credentialFiles?: Record<string, File>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
  experienceSummary: string;
  criminalRecordCertificate?: File;
}
