import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "./SignupForm";

describe("Signup Form", () => {
  describe("Successful signup", () => {
    it("submits signup form with valid data", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText("Prénom"), "John");
      await user.type(screen.getByLabelText("Nom"), "Doe");

      const submitBtn = screen.getByRole("button", { name: /s'inscrire/i });
      await user.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalled();
      expect(handleSubmit.mock.calls[0][0]).toEqual({
        email: "john@example.com",
        firstname: "John",
        lastname: "Doe",
      });
    });
  });

  describe("Form validation", () => {
    it("does not submit with invalid email", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "invalid-email");

      const submitBtn = screen.getByRole("button", { name: /s'inscrire/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with empty email", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      const submitBtn = screen.getByRole("button", { name: /s'inscrire/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with empty firstname", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");

      const submitBtn = screen.getByRole("button", { name: /s'inscrire/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with firstname too short", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText("Prénom"), "J");

      const submitBtn = screen.getByRole("button", { name: /s'inscrire/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with empty lastname", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText("Prénom"), "John");

      const submitBtn = screen.getByRole("button", { name: /s'inscrire/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with lastname too short", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText("Prénom"), "John");
      await user.type(screen.getByLabelText("Nom"), "D");

      const submitBtn = screen.getByRole("button", { name: /s'inscrire/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Loading state", () => {
    it("disables submit button when loading", () => {
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={true} />);

      const submitBtn = screen.getByRole("button", {
        name: /inscription en cours/i,
      });
      expect(submitBtn).toBeDisabled();
    });
  });
});
