import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardHelperForm } from "./OnboardHelperForm";
import { HelperFormDataFixtures } from "../__tests__/fixtures/HelperFormDataFixtures";
import type { OnboardHelperFormData } from "../types/OnboardHelperForm.types";

const fillFormWithData = async (
  user: ReturnType<typeof userEvent.setup>,
  data: OnboardHelperFormData
) => {
  await user.type(screen.getByLabelText(/email/i), data.email);
  await user.type(screen.getByLabelText(/first name/i), data.firstname);
  await user.type(screen.getByLabelText(/last name/i), data.lastname);
  await user.type(screen.getByLabelText(/phone number/i), data.phoneNumber);
  await user.selectOptions(
    screen.getByLabelText(/profession/i),
    data.profession
  );
  await user.type(screen.getByLabelText(/birthdate/i), data.birthdate);
  await user.selectOptions(screen.getByLabelText(/county/i), data.frenchCounty);
};

describe("OnboardHelperForm", () => {
  describe("Rendering and Structure", () => {
    test("renders all form fields with proper labels", () => {
      render(<OnboardHelperForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/profession/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/birthdate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/county/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /onboard/i })
      ).toBeInTheDocument();
    });
  });

  describe("Email Validation", () => {
    test("displays error when email is empty on submit", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      const submitBtn = screen.getByRole("button", { name: /onboard/i });
      await user.click(submitBtn);

      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    });

    test.each([
      ["john@invalid", "invalid email"],
      ["@example.com", "invalid email"],
      ["john.doe", "invalid email"],
      ["john@", "invalid email"],
    ])("displays error for invalid email format: %s", async (email) => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, email);

      const submitBtn = screen.getByRole("button", { name: /onboard/i });
      await user.click(submitBtn);

      expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  describe("Name Validation", () => {
    test("displays error when firstname is empty", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      const submitBtn = screen.getByRole("button", { name: /onboard/i });
      await user.click(submitBtn);

      expect(
        await screen.findByText(/first.*name.*required/i)
      ).toBeInTheDocument();
    });

    test("displays error when firstname is too short", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      await user.type(screen.getByLabelText(/first name/i), "J");
      await user.click(screen.getByRole("button", { name: /onboard/i }));

      expect(
        await screen.findByText(/first.*name.*at least 2/i)
      ).toBeInTheDocument();
    });

    test("displays error when lastname is empty", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      await user.click(screen.getByRole("button", { name: /onboard/i }));

      expect(
        await screen.findByText(/last.*name.*required/i)
      ).toBeInTheDocument();
    });

    test("displays error when lastname is too short", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      await user.type(screen.getByLabelText(/last name/i), "D");
      await user.click(screen.getByRole("button", { name: /onboard/i }));

      expect(
        await screen.findByText(/last.*name.*at least 2/i)
      ).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    test("successfully submits with valid data", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = vi.fn();

      render(<OnboardHelperForm onSubmit={mockOnSubmit} />);

      const validData = HelperFormDataFixtures.aValidFormData();
      await fillFormWithData(user, validData);

      await user.click(screen.getByRole("button", { name: /onboard/i }));

      expect(mockOnSubmit).toHaveBeenCalledWith(validData);
    });

    test("displays all validation errors on submit with empty form", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      await user.click(screen.getByRole("button", { name: /onboard/i }));

      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/first.*name.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/last.*name.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/profession.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/birthdate.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/county.*required/i)).toBeInTheDocument();
    });
  });


  describe("French County Validation", () => {
    test("displays error when county is empty", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/phone number/i), "+33612345678");
      await user.selectOptions(
        screen.getByLabelText(/profession/i),
        "physiotherapist"
      );
      await user.type(screen.getByLabelText(/birthdate/i), "1995-03-26");

      await user.click(screen.getByRole("button", { name: /onboard/i }));

      expect(
        await screen.findByText(/county.*required|required.*county/i)
      ).toBeInTheDocument();
    });
  });
});
