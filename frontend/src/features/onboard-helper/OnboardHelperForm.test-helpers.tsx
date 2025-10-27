import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { OnboardHelperCommand } from "./OnboardHelper.types";
import { HelperCommandFixtures } from "../shared/test-helpers/fixtures";
import { OnboardHelperForm } from "./OnboardHelperForm";

// ==================== Setup Helpers ====================

export const setupTest = () => {
  const user = userEvent.setup();
  return { user };
};

export const renderForm = () => {
  const user = userEvent.setup();
  render(<OnboardHelperForm />);
  return { user };
};

export const setupForm = () => {
  const user = userEvent.setup();
  const mockOnSubmit = vi.fn();

  render(<OnboardHelperForm onSubmit={mockOnSubmit} />);

  const fields = {
    physiotherapistRpps() {
      const matcher = /RPPS Number for Physiotherapist/i;
      return {
        get: () => screen.getByLabelText(matcher),
        find: () => screen.findByLabelText(matcher),
        query: () => screen.queryByLabelText(matcher),
      };
    },
    getDoctorRpps() {
      return screen.getByLabelText(/RPPS Number for Doctor/i);
    },
  };

  const selectPhysiotherapist = () => selectAProfession(user);
  const enterPhysiotherapistRpps = async (rpps = "100012345671") => {
    await user.type(fields.physiotherapistRpps().get(), rpps);
  };

  const selectDoctor = () => selectAProfession(user, /doctor/i);
  const removeDoctor = async () => {
    await user.click(screen.getByLabelText(/Remove Doctor/i));
  };
  const enterDoctorRpps = async (rpps = "10001234567") => {
    await user.type(fields.getDoctorRpps(), rpps);
  };

  const submit = async () => {
    await user.click(screen.getByRole("button", { name: /onboard/i }));
  };

  return {
    user,
    fields,
    selectPhysiotherapist,
    selectDoctor,
    removeDoctor,
    enterDoctorRpps,
    enterPhysiotherapistRpps,
    submit,
    mockOnSubmit,
  };
};

// ==================== Form Action Helpers ====================

export const submitForm = async (user: ReturnType<typeof userEvent.setup>) => {
  const submitBtn = screen.getByRole("button", { name: /onboard/i });
  await user.click(submitBtn);
};

// ==================== Personal Info Helpers ====================

export const enterEmail = async (
  user: ReturnType<typeof userEvent.setup>,
  email = "adrien@example.com"
) => {
  await user.type(screen.getByLabelText(/email/i), email);
};

export const enterPassword = async (
  user: ReturnType<typeof userEvent.setup>,
  password = "12345AZERTpoiu!!!"
) => {
  await user.type(screen.getByLabelText(/password/i), password);
};

export const enterFirstname = async (
  user: ReturnType<typeof userEvent.setup>,
  firstname = "John"
) => {
  await user.type(screen.getByLabelText(/first name/i), firstname);
};

export const enterLastname = async (
  user: ReturnType<typeof userEvent.setup>,
  lastname = "Doe"
) => {
  await user.type(screen.getByLabelText(/last name/i), lastname);
};

export const enterPhoneNumber = async (
  user: ReturnType<typeof userEvent.setup>,
  phoneNumber = "+33123456789"
) => {
  await user.type(screen.getByLabelText(/phone number/i), phoneNumber);
};

export const enterBirthdate = async (
  user: ReturnType<typeof userEvent.setup>,
  birthdate = "1995-03-26"
) => {
  await user.type(screen.getByLabelText(/birthdate/i), birthdate);
};

// ==================== Place of Birth Helpers ====================

export const selectCountryOfBirth = async (
  user: ReturnType<typeof userEvent.setup>,
  country: string | RegExp = /france/i
) => {
  const countrySelect = screen.getByRole("combobox", {
    name: /country of birth/i,
  });
  await user.click(countrySelect);

  const countryOption = await screen.findByRole("option", {
    name: country,
  });
  await user.click(countryOption);
};

export const enterCityOfBirth = async (
  user: ReturnType<typeof userEvent.setup>,
  city = "Nantes"
) => {
  await user.type(screen.getByLabelText(/city of birth/i), city);
};

export const enterZipCode = async (
  user: ReturnType<typeof userEvent.setup>,
  zipCode = "44100"
) => {
  await user.type(screen.getByLabelText(/zip code/i), zipCode);
};

// ==================== Residence Helpers ====================

export const selectCountryOfResidence = async (
  user: ReturnType<typeof userEvent.setup>,
  country: string | RegExp = /france/i
) => {
  const countrySelect = screen.getByRole("combobox", {
    name: /country of residence/i,
  });
  await user.click(countrySelect);

  const countryOption = await screen.findByRole("option", {
    name: country,
  });
  await user.click(countryOption);
};

export const selectAProfession = async (
  user: ReturnType<typeof userEvent.setup>,
  profession: string | RegExp = /physiotherapist/i
) => {
  const professionSelect = screen.getByRole("combobox", {
    name: /profession/i,
  });
  await user.click(professionSelect);

  const professionOption = await screen.findByRole("option", {
    name: profession,
  });
  await user.click(professionOption);
};

export const enterRppsNumber = async (
  user: ReturnType<typeof userEvent.setup>,
  professionLabel: string | RegExp,
  rppsNumber = "12345678901"
) => {
  const rppsInput = screen.getByLabelText(
    new RegExp(
      `RPPS Number for ${professionLabel.toString().replace(/\/i?/g, "")}`,
      "i"
    )
  );
  await user.type(rppsInput, rppsNumber);
};

export const uploadCredentialFile = async (
  user: ReturnType<typeof userEvent.setup>,
  professionLabel: string | RegExp,
  fileName = "credential.pdf"
) => {
  const file = new File(["dummy content"], fileName, {
    type: "application/pdf",
  });
  const fileInput = screen.getByLabelText(
    new RegExp(
      `Credential File for ${professionLabel.toString().replace(/\/i?/g, "")}`,
      "i"
    )
  );
  await user.upload(fileInput, file);
};

export const enterprofessionalDescription = async (
  user: ReturnType<typeof userEvent.setup>,
  professionalDescription = "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Praesentium, natus inventore ipsam vel officiis cum suscipit fugiat laboriosam voluptates neque amet quis, ducimus reiciendis repellendus placeat quas nisi! Laboriosam, perspiciatis."
) => {
  await user.type(
    screen.getByLabelText(/professional description/i),
    professionalDescription
  );
};

// ==================== Composite Helpers ====================

export const fillCompleteForm = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await enterEmail(user);
  await enterPassword(user);
  await enterFirstname(user);
  await enterLastname(user);
  await enterPhoneNumber(user);
  await selectAProfession(user);
  await enterBirthdate(user);
  await selectCountryOfResidence(user);
  await enterprofessionalDescription(user);
};

export const fillValidHelperForm = async (
  user: ReturnType<typeof userEvent.setup>,
  command?: OnboardHelperCommand
) => {
  const cmd = command || HelperCommandFixtures.aValidCommand();

  await enterEmail(user, cmd.email);
  await enterPassword(user, cmd.password);
  await enterFirstname(user, cmd.firstname);
  await enterLastname(user, cmd.lastname);
  await enterPhoneNumber(user, cmd.phoneNumber);
  await enterBirthdate(user, cmd.birthdate);
  await selectCountryOfBirth(user);
  await selectCountryOfResidence(user, /belgium/i);
  await selectAProfession(user, /physiotherapist/i);
  await enterRppsNumber(
    user,
    "Physiotherapist",
    cmd.rppsNumbers.physiotherapist
  );
  await uploadCredentialFile(user, "Physiotherapist");
  await enterprofessionalDescription(user, cmd.professionalDescription);
};

export const fillFormWithBelgiumResidence = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await enterEmail(user);
  await enterPassword(user);
  await enterFirstname(user);
  await enterLastname(user);
  await enterPhoneNumber(user);
  await enterBirthdate(user);
  await selectCountryOfBirth(user);
  await selectCountryOfResidence(user, /belgium/i);
  await selectAProfession(user, /physiotherapist/i);
  await enterRppsNumber(user, "Physiotherapist", "12345678901");
  await uploadCredentialFile(user, "Physiotherapist");
  await enterprofessionalDescription(user);
};

export const fillBasicInfoOnly = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await enterEmail(user);
  await enterPassword(user);
  await enterFirstname(user);
  await enterLastname(user);
  await enterPhoneNumber(user);
  await enterBirthdate(user);
  await selectCountryOfBirth(user);
  await selectCountryOfResidence(user, /belgium/i);
  await enterprofessionalDescription(user);
};

export const fillFormWithMultipleProfessions = async (
  user: ReturnType<typeof userEvent.setup>,
  professions: Array<{
    name: string | RegExp;
    label: string;
    rpps: string;
  }>
) => {
  await fillBasicInfoOnly(user);

  for (const profession of professions) {
    await selectAProfession(user, profession.name);
    await enterRppsNumber(user, profession.label, profession.rpps);
    await uploadCredentialFile(user, profession.label);
  }
};

// ==================== Assertion Helpers ====================

export const expectSubmitToBeCalledWith = async (
  mockOnSubmit: ReturnType<typeof vi.fn>,
  expectedData: Partial<OnboardHelperCommand>
) => {
  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining(expectedData)
    );
  });
};

export const expectSubmitToBeCalled = async (
  mockOnSubmit: ReturnType<typeof vi.fn>
) => {
  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalled();
  });
};

export const expectSubmitNotToBeCalled = (
  mockOnSubmit: ReturnType<typeof vi.fn>
) => {
  expect(mockOnSubmit).not.toHaveBeenCalled();
};
