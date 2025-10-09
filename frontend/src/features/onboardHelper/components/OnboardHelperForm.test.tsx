import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardHelperForm } from "./OnboardHelperForm";

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

  describe("User Interactions", () => {
    test("accepts email input", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "test@example.com");

      expect(emailInput).toHaveValue("test@example.com");
    });

    test("accepts firstname input", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      const firstnameInput = screen.getByLabelText(/first name/i);
      await user.type(firstnameInput, "John");

      expect(firstnameInput).toHaveValue("John");
    });

    test("accepts lastname input", async () => {
      const user = userEvent.setup();
      render(<OnboardHelperForm />);

      const lastnameInput = screen.getByLabelText(/last name/i);
      await user.type(lastnameInput, "Doe");

      expect(lastnameInput).toHaveValue("Doe");
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

      await user.type(screen.getByLabelText(/email/i), "john.doe@example.com");
      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/phone number/i), "+33612345678");
      await user.selectOptions(
        screen.getByLabelText(/profession/i),
        "physiotherapist"
      );
      await user.type(screen.getByLabelText(/birthdate/i), "1995-03-26");
      await user.selectOptions(screen.getByLabelText(/county/i), "44");

      await user.click(screen.getByRole("button", { name: /onboard/i }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: "john.doe@example.com",
        firstname: "John",
        lastname: "Doe",
        phoneNumber: "+33612345678",
        profession: "physiotherapist",
        birthdate: "1995-03-26",
        frenchCounty: "44",
      });
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
});
