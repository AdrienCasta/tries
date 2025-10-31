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
      await user.type(screen.getByLabelText(/^password$/i), "SecurePass123!");
      await user.type(screen.getByLabelText(/confirm password/i), "SecurePass123!");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });
    });
  });

  describe("Form validation", () => {
    it("does not submit with invalid email", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "invalid-email");
      await user.type(screen.getByLabelText(/password/i), "SecurePass123!");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with empty email", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/password/i), "SecurePass123!");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with password too short", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "Short1!");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with password missing uppercase", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123!");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with password missing number", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "SecurePass!");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with password missing special character", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "SecurePass123");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with empty password", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Password confirmation validation", () => {
    it("does not submit when passwords don't match", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/^password$/i), "SecurePass123!");
      await user.type(screen.getByLabelText(/confirm password/i), "DifferentPass!");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit with empty confirm password", async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={false} />);

      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/^password$/i), "SecurePass123!");

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      await user.click(submitBtn);

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Loading state", () => {
    it("disables submit button when loading", () => {
      const handleSubmit = vi.fn();
      render(<SignupForm onSubmit={handleSubmit} isLoading={true} />);

      const submitBtn = screen.getByRole("button", { name: /sign up/i });
      expect(submitBtn).toBeDisabled();
    });
  });
});
