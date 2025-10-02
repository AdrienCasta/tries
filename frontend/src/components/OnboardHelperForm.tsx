import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

type OnboardHelperFormProps = {
  onSubmit: (data: {
    email: string;
    firstname: string;
    lastname: string;
  }) => void;
};

export function OnboardHelperForm({ onSubmit }: OnboardHelperFormProps) {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email || !firstname || !lastname) {
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    onSubmit({ email, firstname, lastname });

    setEmail("");
    setFirstname("");
    setLastname("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="email"
        />
        {emailError && <span role="alert">{emailError}</span>}
      </div>

      <div>
        <label htmlFor="firstname">First Name</label>
        <input
          id="firstname"
          type="text"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          data-testid="firstname"
        />
      </div>

      <div>
        <label htmlFor="lastname">Last Name</label>
        <input
          id="lastname"
          type="text"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          data-testid="lastname"
        />
      </div>

      <Button type="submit">Onboard</Button>
    </form>
  );
}
