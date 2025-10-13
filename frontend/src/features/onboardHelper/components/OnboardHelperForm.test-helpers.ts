import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ==================== Setup Helpers ====================

export const setupTest = () => {
  const user = userEvent.setup();
  return { user };
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

// ==================== Profession Helpers ====================

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
    new RegExp(`RPPS Number for ${professionLabel.toString().replace(/\/i?/g, "")}`, "i")
  );
  await user.type(rppsInput, rppsNumber);
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
  await enterFirstname(user);
  await enterLastname(user);
  await enterPhoneNumber(user);
  await selectAProfession(user);
  await enterBirthdate(user);
  await selectCountryOfResidence(user);
  await enterprofessionalDescription(user);
};
