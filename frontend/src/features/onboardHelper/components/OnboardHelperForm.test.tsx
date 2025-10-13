import { describe, test, expect, vi, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardHelperForm } from "./OnboardHelperForm";
import { HelperCommandFixtures } from "../__tests__/fixtures/HelperCommandFixtures";
import type { OnboardHelperCommand } from "../types/OnboardHelperForm.types";
import {
  submitForm,
  renderForm,
  renderFormWithSubmit,
  fillFormWithBelgiumResidence,
  fillBasicInfoOnly,
  fillFormWithMultipleProfessions,
  fillValidHelperForm,
  expectSubmitToBeCalled,
  expectSubmitToBeCalledWith,
  expectSubmitNotToBeCalled,
  enterEmail,
  enterFirstname,
  enterLastname,
  enterPhoneNumber,
  enterBirthdate,
  selectCountryOfBirth,
  enterCityOfBirth,
  enterZipCode,
  selectCountryOfResidence,
  selectAProfession,
  enterprofessionalDescription,
  enterRppsNumber,
} from "./OnboardHelperForm.test-helpers";

// describe("OnboardHelperForm", () => {
//   describe("Rendering and Structure", () => {
//     test("renders all form fields with proper labels", () => {
//       render(<OnboardHelperForm />);

//       expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/profession/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/birthdate/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/county/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/country of birth/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/city of birth/i)).toBeInTheDocument();
//       expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();

//       expect(
//         screen.getByRole("button", { name: /onboard/i })
//       ).toBeInTheDocument();
//     });
//   });

//   describe("Email Validation", () => {
//     test("displays error when email is empty on submit", async () => {
//       const user = userEvent.setup();
//       render(<OnboardHelperForm />);

//       const submitBtn = screen.getByRole("button", { name: /onboard/i });
//       await user.click(submitBtn);

//       expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
//     });

//     test.each([
//       ["john@invalid", "invalid email"],
//       ["@example.com", "invalid email"],
//       ["john.doe", "invalid email"],
//       ["john@", "invalid email"],
//     ])("displays error for invalid email format: %s", async (email) => {
//       const user = userEvent.setup();
//       render(<OnboardHelperForm />);

//       const emailInput = screen.getByLabelText(/email/i);
//       await user.type(emailInput, email);

//       const submitBtn = screen.getByRole("button", { name: /onboard/i });
//       await user.click(submitBtn);

//       expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
//     });
//   });

//   describe("Name Validation", () => {
//     test("displays error when firstname is empty", async () => {
//       const user = userEvent.setup();
//       render(<OnboardHelperForm />);

//       const submitBtn = screen.getByRole("button", { name: /onboard/i });
//       await user.click(submitBtn);

//       expect(
//         await screen.findByText(/first.*name.*required/i)
//       ).toBeInTheDocument();
//     });

//     test("displays error when firstname is too short", async () => {
//       const user = userEvent.setup();
//       render(<OnboardHelperForm />);

//       await user.type(screen.getByLabelText(/first name/i), "J");
//       await user.click(screen.getByRole("button", { name: /onboard/i }));

//       expect(
//         await screen.findByText(/first.*name.*at least 2/i)
//       ).toBeInTheDocument();
//     });

//     test("displays error when lastname is empty", async () => {
//       const user = userEvent.setup();
//       render(<OnboardHelperForm />);

//       await user.click(screen.getByRole("button", { name: /onboard/i }));

//       expect(
//         await screen.findByText(/last.*name.*required/i)
//       ).toBeInTheDocument();
//     });

//     test("displays error when lastname is too short", async () => {
//       const user = userEvent.setup();
//       render(<OnboardHelperForm />);

//       await user.type(screen.getByLabelText(/last name/i), "D");
//       await user.click(screen.getByRole("button", { name: /onboard/i }));

//       expect(
//         await screen.findByText(/last.*name.*at least 2/i)
//       ).toBeInTheDocument();
//     });
//   });

//   describe("Form Submission", () => {
//     test("successfully submits with valid data", async () => {
//       const user = userEvent.setup();
//       const mockOnSubmit = vi.fn();

//       render(<OnboardHelperForm onSubmit={mockOnSubmit} />);

//       const validData = HelperFormDataFixtures.aValidFormData();
//       await fillFormWithData(user, validData);

//       await user.click(screen.getByRole("button", { name: /onboard/i }));

//       expect(mockOnSubmit).toHaveBeenCalledWith(validData);
//     });

//     test("displays all validation errors on submit with empty form", async () => {
//       const user = userEvent.setup();
//       render(<OnboardHelperForm />);

//       await user.click(screen.getByRole("button", { name: /onboard/i }));

//       expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/first.*name.*required/i)).toBeInTheDocument();
//       expect(screen.getByText(/last.*name.*required/i)).toBeInTheDocument();
//       expect(screen.getByText(/phone.*required/i)).toBeInTheDocument();
//       expect(screen.getByText(/profession.*required/i)).toBeInTheDocument();
//       expect(screen.getByText(/birthdate.*required/i)).toBeInTheDocument();
//       expect(screen.getByText(/county.*required/i)).toBeInTheDocument();
//     });
//   });

//   describe("French County Validation", () => {
//     test("displays error when county is empty", async () => {
//       const user = userEvent.setup();
//       render(<OnboardHelperForm />);

//       await user.type(screen.getByLabelText(/email/i), "test@example.com");
//       await user.type(screen.getByLabelText(/first name/i), "John");
//       await user.type(screen.getByLabelText(/last name/i), "Doe");
//       await user.type(screen.getByLabelText(/phone number/i), "+33612345678");

//       const professionButton = screen.getByRole("combobox", {
//         name: /profession/i,
//       });
//       await user.click(professionButton);
//       const professionOption = await screen.findByRole("option", {
//         name: /physiotherapist/i,
//       });
//       await user.click(professionOption);

//       await user.type(screen.getByLabelText(/birthdate/i), "1995-03-26");

//       await user.click(screen.getByRole("button", { name: /onboard/i }));

//       expect(
//         await screen.findByText(/county.*required|required.*county/i)
//       ).toBeInTheDocument();
//     });
//   });

// });
describe("Place of birth", () => {
  it("selects the country of birth", async () => {
    const { user } = renderForm();

    await fillValidHelperForm(user);
    await selectCountryOfBirth(user);
    await enterCityOfBirth(user);
    await enterZipCode(user);

    await submitForm(user);
  });
});

describe("Country of Residence", () => {
  it("allows user to select country of residence", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectCountryOfResidence(user, /belgium/i);

    const countrySelect = screen.getByRole("combobox", {
      name: /country of residence/i,
    });
    expect(countrySelect).toHaveTextContent(/belgium/i);
  });

  it("shows French county field when France is selected", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectCountryOfResidence(user, /france/i);

    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: /french county/i })
      ).toBeInTheDocument();
    });
  });

  it("hides French county field when Belgium is selected", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectCountryOfResidence(user, /belgium/i);

    expect(
      screen.queryByRole("combobox", { name: /french county/i })
    ).not.toBeInTheDocument();
  });

  it("shows validation error when France selected but no county provided", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<OnboardHelperForm onSubmit={mockOnSubmit} />);

    await selectCountryOfResidence(user, /france/i);
    await submitForm(user);

    // Should show validation error for missing county
    expect(
      await screen.findByText(/county.*required|required.*county/i)
    ).toBeInTheDocument();

    // Should not have called onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("successfully submits when Belgium selected without county", async () => {
    const { user, mockOnSubmit } = renderFormWithSubmit();

    await fillFormWithBelgiumResidence(user);
    await submitForm(user);

    await expectSubmitToBeCalled(mockOnSubmit);
  });
});

describe("Multiple Professions", () => {
  it("stores selected profession in professions array", async () => {
    const { user, mockOnSubmit } = renderFormWithSubmit();

    await fillFormWithBelgiumResidence(user);
    await submitForm(user);

    await expectSubmitToBeCalledWith(mockOnSubmit, {
      professions: ["physiotherapist"],
    });
  });

  it("displays selected profession in a list", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);

    expect(screen.getByText("Doctor")).toBeInTheDocument();
  });

  it("allows adding multiple professions", async () => {
    const { user, mockOnSubmit } = renderFormWithSubmit();

    await fillFormWithMultipleProfessions(user, [
      { name: /doctor/i, label: "Doctor", rpps: "11111111111" },
      { name: /physiotherapist/i, label: "Physiotherapist", rpps: "22222222222" },
    ]);

    expect(screen.getByText("Doctor")).toBeInTheDocument();
    expect(screen.getByText("Physiotherapist")).toBeInTheDocument();

    await submitForm(user);

    await expectSubmitToBeCalledWith(mockOnSubmit, {
      professions: expect.arrayContaining(["doctor", "physiotherapist"]),
    });
  });

  it("removes already selected profession from dropdown", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    // Add Doctor
    const professionSelect = screen.getByRole("combobox", {
      name: /professions/i,
    });
    await user.click(professionSelect);
    const doctorOption = await screen.findByRole("option", { name: /doctor/i });
    await user.click(doctorOption);

    // Open dropdown again
    await user.click(professionSelect);

    // Doctor should not be in options, but Physiotherapist and Sports Coach should be
    await waitFor(() => {
      expect(screen.queryByRole("option", { name: /^doctor$/i })).not.toBeInTheDocument();
      expect(screen.getByRole("option", { name: /physiotherapist/i })).toBeInTheDocument();
    });
  });

  it("allows removing a selected profession", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    // Add two professions
    await selectAProfession(user, /doctor/i);
    await selectAProfession(user, /physiotherapist/i);

    // Both should be visible
    expect(screen.getByText("Doctor")).toBeInTheDocument();
    expect(screen.getByText("Physiotherapist")).toBeInTheDocument();

    // Remove Doctor
    const removeDoctorButton = screen.getByLabelText(/remove doctor/i);
    await user.click(removeDoctorButton);

    // Remove button for Doctor should be gone, Physiotherapist should remain
    await waitFor(() => {
      expect(screen.queryByLabelText(/remove doctor/i)).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText(/remove physiotherapist/i)).toBeInTheDocument();
  });

  it("hides selector when all professions are selected", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    // Add all three professions
    await selectAProfession(user, /doctor/i);
    await selectAProfession(user, /physiotherapist/i);
    await selectAProfession(user, /sports coach/i);

    // Selector should be hidden, message should be shown
    await waitFor(() => {
      expect(
        screen.queryByRole("combobox", { name: /professions/i })
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(/all professions have been selected/i)
      ).toBeInTheDocument();
    });
  });

  it("shows validation error when no profession selected", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<OnboardHelperForm onSubmit={mockOnSubmit} />);

    // Don't select any profession, just submit
    await submitForm(user);

    // Should show validation error
    expect(
      await screen.findByText(/at least one profession is required/i)
    ).toBeInTheDocument();

    // Should not call onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("complete flow: add, remove, and submit multiple professions", async () => {
    const { user, mockOnSubmit } = renderFormWithSubmit();

    await fillBasicInfoOnly(user);

    await selectAProfession(user, /doctor/i);
    await enterRppsNumber(user, "Doctor", "11111111111");

    await selectAProfession(user, /physiotherapist/i);
    await enterRppsNumber(user, "Physiotherapist", "22222222222");

    const removeDoctorButton = screen.getByLabelText(/remove doctor/i);
    await user.click(removeDoctorButton);

    await selectAProfession(user, /sports coach/i);
    await enterRppsNumber(user, "Sports Coach", "33333333333");

    await waitFor(() => {
      expect(screen.queryByLabelText(/remove doctor/i)).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText(/remove physiotherapist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remove sports coach/i)).toBeInTheDocument();

    await submitForm(user);

    await expectSubmitToBeCalledWith(mockOnSubmit, {
      professions: ["physiotherapist", "sports_coach"],
    });
  });
});

describe("RPPS Number for Each Profession", () => {
  it("displays RPPS input field when a profession is selected", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);

    expect(
      screen.getByLabelText(/RPPS Number for Doctor/i)
    ).toBeInTheDocument();
  });

  it("displays RPPS input fields for multiple professions", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);
    await selectAProfession(user, /physiotherapist/i);

    expect(
      screen.getByLabelText(/RPPS Number for Doctor/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/RPPS Number for Physiotherapist/i)
    ).toBeInTheDocument();
  });

  it("removes RPPS input field when profession is removed", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);
    expect(
      screen.getByLabelText(/RPPS Number for Doctor/i)
    ).toBeInTheDocument();

    const removeButton = screen.getByLabelText(/Remove Doctor/i);
    await user.click(removeButton);

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/RPPS Number for Doctor/i)
      ).not.toBeInTheDocument();
    });
  });

  it("shows validation error when RPPS number is missing for a profession", async () => {
    const { user, mockOnSubmit } = renderFormWithSubmit();

    await fillBasicInfoOnly(user);
    await selectAProfession(user, /doctor/i);
    await submitForm(user);

    expect(
      await screen.findByText(/RPPS number is required for each profession/i)
    ).toBeInTheDocument();
    expectSubmitNotToBeCalled(mockOnSubmit);
  });

  it("successfully submits when RPPS numbers are provided for all professions", async () => {
    const { user, mockOnSubmit } = renderFormWithSubmit();

    await fillFormWithMultipleProfessions(user, [
      { name: /doctor/i, label: "Doctor", rpps: "12345678901" },
      { name: /physiotherapist/i, label: "Physiotherapist", rpps: "98765432109" },
    ]);

    await submitForm(user);

    await expectSubmitToBeCalledWith(mockOnSubmit, {
      professions: ["doctor", "physiotherapist"],
      rppsNumbers: {
        doctor: "12345678901",
        physiotherapist: "98765432109",
      },
    });
  });

  it("maintains RPPS number values when switching between fields", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);
    const doctorRppsInput = screen.getByLabelText(/RPPS Number for Doctor/i);
    await user.type(doctorRppsInput, "12345678901");

    await selectAProfession(user, /physiotherapist/i);
    const physioRppsInput = screen.getByLabelText(/RPPS Number for Physiotherapist/i);
    await user.type(physioRppsInput, "98765432109");

    expect(doctorRppsInput).toHaveValue("12345678901");
    expect(physioRppsInput).toHaveValue("98765432109");
  });

  it("clears RPPS number data when profession is removed and re-added", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);
    const doctorRppsInput = screen.getByLabelText(/RPPS Number for Doctor/i);
    await user.type(doctorRppsInput, "12345678901");

    const removeButton = screen.getByLabelText(/Remove Doctor/i);
    await user.click(removeButton);

    await selectAProfession(user, /doctor/i);
    const newDoctorRppsInput = screen.getByLabelText(/RPPS Number for Doctor/i);

    expect(newDoctorRppsInput).toHaveValue("");
  });
});
