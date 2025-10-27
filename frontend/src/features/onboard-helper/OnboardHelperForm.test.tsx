import { describe, expect, vi, it, beforeAll, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardHelperForm } from "./OnboardHelperForm";
import {
  submitForm,
  renderForm,
  setupForm,
  fillFormWithBelgiumResidence,
  fillBasicInfoOnly,
  fillFormWithMultipleProfessions,
  fillValidHelperForm,
  expectSubmitToBeCalled,
  expectSubmitToBeCalledWith,
  expectSubmitNotToBeCalled,
  selectCountryOfBirth,
  enterCityOfBirth,
  enterZipCode,
  selectCountryOfResidence,
  selectAProfession,
  enterRppsNumber,
  uploadCredentialFile,
} from "./OnboardHelperForm.test-helpers";

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

    expect(
      await screen.findByText(/county.*required|required.*county/i)
    ).toBeInTheDocument();

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("successfully submits when Belgium selected without county", async () => {
    const { user, mockOnSubmit } = setupForm();

    await fillFormWithBelgiumResidence(user);
    await submitForm(user);

    await expectSubmitToBeCalled(mockOnSubmit);
  });
});

describe("Multiple Professions", () => {
  it("stores selected profession in professions array", async () => {
    const { user, mockOnSubmit } = setupForm();

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
    const { user, mockOnSubmit } = setupForm();

    await fillFormWithMultipleProfessions(user, [
      { name: /doctor/i, label: "Doctor", rpps: "11111111111" },
      {
        name: /physiotherapist/i,
        label: "Physiotherapist",
        rpps: "22222222222",
      },
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

    const professionSelect = screen.getByRole("combobox", {
      name: /professions/i,
    });
    await user.click(professionSelect);
    const doctorOption = await screen.findByRole("option", { name: /doctor/i });
    await user.click(doctorOption);

    await user.click(professionSelect);

    await waitFor(() => {
      expect(
        screen.queryByRole("option", { name: /^doctor$/i })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /physiotherapist/i })
      ).toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.queryByLabelText(/remove doctor/i)).not.toBeInTheDocument();
    });
    expect(
      screen.getByLabelText(/remove physiotherapist/i)
    ).toBeInTheDocument();
  });

  it("hides selector when all professions are selected", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);
    await selectAProfession(user, /physiotherapist/i);
    await selectAProfession(user, /sports coach/i);

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

    await submitForm(user);

    expect(
      await screen.findByText(/at least one profession is required/i)
    ).toBeInTheDocument();

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("complete flow: add, remove, and submit multiple professions", async () => {
    const { user, mockOnSubmit } = setupForm();

    await fillBasicInfoOnly(user);

    await selectAProfession(user, /doctor/i);
    await enterRppsNumber(user, "Doctor", "11111111111");
    await uploadCredentialFile(user, "Doctor");

    await selectAProfession(user, /physiotherapist/i);
    await enterRppsNumber(user, "Physiotherapist", "22222222222");
    await uploadCredentialFile(user, "Physiotherapist");

    const removeDoctorButton = screen.getByLabelText(/remove doctor/i);
    await user.click(removeDoctorButton);

    await selectAProfession(user, /sports coach/i);
    await enterRppsNumber(user, "Sports Coach", "33333333333");
    await uploadCredentialFile(user, "Sports Coach");

    await waitFor(() => {
      expect(screen.queryByLabelText(/remove doctor/i)).not.toBeInTheDocument();
    });
    expect(
      screen.getByLabelText(/remove physiotherapist/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/remove sports coach/i)).toBeInTheDocument();

    await submitForm(user);

    await expectSubmitToBeCalledWith(mockOnSubmit, {
      professions: ["physiotherapist", "sports_coach"],
    });
  });
});

describe("Credential File Upload", () => {
  it("allows submission without credential files", async () => {
    const { user, mockOnSubmit } = setupForm();

    await fillBasicInfoOnly(user);
    await selectAProfession(user, /physiotherapist/i);
    await enterRppsNumber(user, "Physiotherapist", "12345678901");

    await submitForm(user);

    await expectSubmitToBeCalled(mockOnSubmit);
  });

  it("displays helper text about credential requirement for full access", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);

    expect(
      screen.getByText(/upload.*credential.*full.*access/i)
    ).toBeInTheDocument();
  });

  it("displays credential file input when a profession is selected", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);

    expect(
      screen.getByLabelText(/Credential File for Doctor/i)
    ).toBeInTheDocument();
  });

  it("allows uploading a PDF file for a profession", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);

    const file = new File(["dummy content"], "credential.pdf", {
      type: "application/pdf",
    });
    const fileInput = screen.getByLabelText(/Credential File for Doctor/i);

    await user.upload(fileInput, file);

    expect(fileInput).toHaveProperty("files[0].name", "credential.pdf");
  });

  it("displays file name after uploading", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);

    const file = new File(["dummy content"], "my-credential.pdf", {
      type: "application/pdf",
    });
    const fileInput = screen.getByLabelText(/Credential File for Doctor/i);

    await user.upload(fileInput, file);

    expect(screen.getByText(/my-credential.pdf/i)).toBeInTheDocument();
  });

  it.skip("shows validation error for non-PDF file", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<OnboardHelperForm onSubmit={mockOnSubmit} />);

    await fillBasicInfoOnly(user);
    await selectAProfession(user, /doctor/i);
    await enterRppsNumber(user, "Doctor", "12345678901");

    const file = new File(["dummy content"], "credential.jpg", {
      type: "image/jpeg",
    });
    const fileInput = screen.getByLabelText(/Credential File for Doctor/i);
    await user.upload(fileInput, file);

    await submitForm(user);

    expect(
      await screen.findByText(/Credential must be in PDF format/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error for file exceeding 10MB", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<OnboardHelperForm onSubmit={mockOnSubmit} />);

    await fillBasicInfoOnly(user);
    await selectAProfession(user, /doctor/i);
    await enterRppsNumber(user, "Doctor", "12345678901");

    const largeFile = new File(
      [new ArrayBuffer(11 * 1024 * 1024)],
      "credential.pdf",
      { type: "application/pdf" }
    );
    const fileInput = screen.getByLabelText(/Credential File for Doctor/i);
    await user.upload(fileInput, largeFile);

    await submitForm(user);

    expect(
      await screen.findByText(/Credential file size exceeds 10MB limit/i)
    ).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("displays file input for each selected profession", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);
    await selectAProfession(user, /physiotherapist/i);

    expect(
      screen.getByLabelText(/Credential File for Doctor/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Credential File for Physiotherapist/i)
    ).toBeInTheDocument();
  });

  it("removes credential file input when profession is removed", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);
    expect(
      screen.getByLabelText(/Credential File for Doctor/i)
    ).toBeInTheDocument();

    const removeDoctorButton = screen.getByLabelText(/remove doctor/i);
    await user.click(removeDoctorButton);

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/Credential File for Doctor/i)
      ).not.toBeInTheDocument();
    });
  });

  it("allows submission when credential file is missing (optional)", async () => {
    const { user, mockOnSubmit } = setupForm();

    await fillBasicInfoOnly(user);
    await selectAProfession(user, /doctor/i);
    await enterRppsNumber(user, "Doctor", "12345678901");

    await submitForm(user);

    await expectSubmitToBeCalled(mockOnSubmit);
  });

  it("successfully submits with valid PDF credentials for all professions", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    render(<OnboardHelperForm onSubmit={mockOnSubmit} />);

    await fillBasicInfoOnly(user);

    await selectAProfession(user, /doctor/i);
    await enterRppsNumber(user, "Doctor", "12345678901");
    const doctorFile = new File(["doctor content"], "doctor-credential.pdf", {
      type: "application/pdf",
    });
    await user.upload(
      screen.getByLabelText(/Credential File for Doctor/i),
      doctorFile
    );

    await selectAProfession(user, /physiotherapist/i);
    await enterRppsNumber(user, "Physiotherapist", "98765432109");
    const physioFile = new File(["physio content"], "physio-credential.pdf", {
      type: "application/pdf",
    });
    await user.upload(
      screen.getByLabelText(/Credential File for Physiotherapist/i),
      physioFile
    );

    await submitForm(user);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          professions: ["doctor", "physiotherapist"],
          credentialFiles: {
            doctor: doctorFile,
            physiotherapist: physioFile,
          },
        })
      );
    });
  });

  it("clears credential file data when profession is removed and re-added", async () => {
    const user = userEvent.setup();
    render(<OnboardHelperForm />);

    await selectAProfession(user, /doctor/i);
    const file = new File(["content"], "credential.pdf", {
      type: "application/pdf",
    });
    await user.upload(
      screen.getByLabelText(/Credential File for Doctor/i),
      file
    );

    const removeDoctorButton = screen.getByLabelText(/remove doctor/i);
    await user.click(removeDoctorButton);

    await selectAProfession(user, /doctor/i);

    const fileInput = screen.getByLabelText(/Credential File for Doctor/i);
    expect(fileInput).toHaveProperty("files.length", 0);
  });
});

describe("Add RPPS to a selected profession", () => {
  let setup: ReturnType<typeof setupForm>;
  let user: typeof setup.user;
  let mockOnSubmit: typeof setup.mockOnSubmit;

  beforeEach(() => {
    setup = setupForm();
    user = setup.user;
    mockOnSubmit = setup.mockOnSubmit;
  });

  it("displays RPPS input field when a profession is selected", async () => {
    await setup.selectDoctor();

    expect(setup.fields.getDoctorRpps()).toBeInTheDocument();
  });

  it("displays RPPS input fields for multiple professions", async () => {
    await setup.selectDoctor();
    await setup.selectPhysiotherapist();

    expect(setup.fields.getDoctorRpps()).toBeInTheDocument();
    expect(setup.fields.physiotherapistRpps().get()).toBeInTheDocument();
  });

  it("removes RPPS input field when profession is removed", async () => {
    await setup.selectDoctor();
    expect(setup.fields.getDoctorRpps()).toBeInTheDocument();

    await setup.removeDoctor();

    expect(setup.fields.physiotherapistRpps().query()).not.toBeInTheDocument();
  });
  it("shows validation error when RPPS number is greater than 11-digit long", async () => {
    await fillBasicInfoOnly(user);
    await setup.selectPhysiotherapist();

    const tooLongRpps = "100012345671";
    await setup.enterPhysiotherapistRpps(tooLongRpps);
    await setup.submit();

    expect(
      await screen.findByText(/Rpps must be exactly 11 digits./i)
    ).toBeInTheDocument();
    expectSubmitNotToBeCalled(mockOnSubmit);
  });

  it("shows validation error when RPPS number is less than 11-digit long", async () => {
    await fillBasicInfoOnly(user);
    await setup.selectPhysiotherapist();

    const tooShortRpps = "100012";
    await setup.enterPhysiotherapistRpps(tooShortRpps);
    await setup.submit();

    expect(
      await screen.findByText(/Rpps must be exactly 11 digits./i)
    ).toBeInTheDocument();
    expectSubmitNotToBeCalled(mockOnSubmit);
  });
  it("shows validation error when RPPS number is not composed with only digit", async () => {
    await fillBasicInfoOnly(user);
    await setup.selectPhysiotherapist();

    const notDigitOnly = "1A0012345671";
    await setup.enterPhysiotherapistRpps(notDigitOnly);
    await setup.submit();

    expect(
      await screen.findByText(/Rpps must be exactly 11 digits./i)
    ).toBeInTheDocument();
    expectSubmitNotToBeCalled(mockOnSubmit);
  });
  it("maintains RPPS number values when switching between fields", async () => {
    await setup.selectDoctor();
    await setup.enterDoctorRpps("12345678901");

    await setup.selectPhysiotherapist();
    await setup.enterPhysiotherapistRpps("98765432109");

    expect(setup.fields.getDoctorRpps()).toHaveValue("12345678901");
    expect(setup.fields.physiotherapistRpps().get()).toHaveValue("98765432109");
  });
  it("clears RPPS number data when profession is removed and re-added", async () => {
    await setup.selectDoctor();
    await setup.enterDoctorRpps();

    const removeButton = screen.getByLabelText(/Remove Doctor/i);
    await user.click(removeButton);

    await setup.selectDoctor();

    expect(setup.fields.getDoctorRpps()).toHaveValue("");
  });
  it("shows validation error when RPPS number is missing for a profession", async () => {
    await fillBasicInfoOnly(user);
    await setup.selectDoctor();
    await uploadCredentialFile(user, "Doctor");
    await submitForm(user);

    expect(
      await screen.findByText(/RPPS number is required for each profession/i)
    ).toBeInTheDocument();
    expectSubmitNotToBeCalled(mockOnSubmit);
  });
  it("successfully submits when RPPS numbers are provided for all professions", async () => {
    await fillFormWithMultipleProfessions(user, [
      { name: /doctor/i, label: "Doctor", rpps: "12345678901" },
      {
        name: /physiotherapist/i,
        label: "Physiotherapist",
        rpps: "98765432109",
      },
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
});
