import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerHelperSchema } from "./RegisterHelper.schema";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIRTH_COUNTRIES } from "../shared/constants/birthCountries";

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
  it("knows a valid firstname is required to submit form", async () => {
    await fillForm(user, { firstname: "56789" });
  });
  it("knows a valid lastname is required to submit form", async () => {
    await fillForm(user, { lastname: "56789" });
  });
  it("knows a valid password is required to submit form", async () => {
    await fillForm(user, { password: "AZERT" });
  });
  it("knows a valid birthdate is required to submit form", async () => {
    await fillForm(user, { birthdate: "2100-01-01" });
  });
  it("knows a valid phone number is required to submit form", async () => {
    await fillForm(user, { phoneNumber: "567890" });
  });
  it("knows a valid birth city is required to submit form", async () => {
    await fillForm(user, {
      placeOfBirth: {
        country: "FR",
        city: "",
      },
    });
  });
});

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides?: Partial<RegisterHelperCommand>
) {
  await user.type(
    screen.getByLabelText(/email/i),
    overrides?.email ?? "adrien@tries.fr"
  );
  await user.type(
    screen.getByLabelText(/firstname/i),
    overrides?.firstname ?? "adrien"
  );
  await user.type(
    screen.getByLabelText(/lastname/i),
    overrides?.lastname ?? "Guyot"
  );
  await user.type(
    screen.getByLabelText(/password/i),
    overrides?.password ?? "P@ssw0rd!"
  );
  await user.type(
    screen.getByLabelText(/birthdate/i),
    overrides?.birthdate ?? "1995-26-03"
  );
  await user.type(
    screen.getByLabelText(/phone number/i),
    overrides?.phoneNumber ?? "0612345678"
  );

  if (overrides?.placeOfBirth?.country && overrides.placeOfBirth.country !== "FR") {
    const countryCode = overrides.placeOfBirth.country;
    const country = Object.values(BIRTH_COUNTRIES)
      .flat()
      .find((c) => c.code === countryCode);

    if (country) {
      const countrySelect = screen.getByLabelText(/country of birth/i);
      await user.click(countrySelect);
      await user.click(screen.getByRole("option", { name: country.label }));
    }
  }

  const cityField = screen.getByLabelText(/city of birth/i);
  const city = overrides?.placeOfBirth?.city ?? "Paris";
  if (city === "") {
    await user.clear(cityField);
  } else {
    await user.type(cityField, city);
  }
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
  professions: Array<{
    code: string;
    healthId: { rpps: string } | { adeli: string };
    credential?: {
      fileType: string;
      fileSize?: number;
    };
  }>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
  criminalRecordCertificate?: {
    fileType: string;
    fileSize?: number;
  };
}

type RegisterHelperFormProps = {
  onSubmit: (data: z.infer<typeof registerHelperSchema>) => void;
};

function RegisterHelperForm({ onSubmit }: RegisterHelperFormProps) {
  const form = useForm<z.infer<typeof registerHelperSchema>>({
    resolver: zodResolver(registerHelperSchema),
    defaultValues: {
      email: "",
      firstname: "",
      placeOfBirth: {
        country: "FR",
        city: "",
      },
    },
  });

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Signup to Tries</CardTitle>
      </CardHeader>
      <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    type="email"
                    id="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your e-mail "
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    {...field}
                    type="password"
                    id="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="firstname"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstname">Firstname</FieldLabel>
                  <Input
                    {...field}
                    id="firstname"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your firstname"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastname"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lastname">Lastname</FieldLabel>
                  <Input
                    {...field}
                    id="lastname"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your lastname"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="birthdate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="birthdate">birthdate</FieldLabel>
                  <Input
                    {...field}
                    type="date"
                    id="birthdate"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your birthdate"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
                  <Input
                    {...field}
                    type="tel"
                    id="phoneNumber"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your phone number"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="placeOfBirth.country"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="country">Country of birth</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger id="country" aria-label="Country of birth">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Europe</SelectLabel>
                        {BIRTH_COUNTRIES.EUROPE.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Africa</SelectLabel>
                        {BIRTH_COUNTRIES.AFRICA.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Asia</SelectLabel>
                        {BIRTH_COUNTRIES.ASIA.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>North America</SelectLabel>
                        {BIRTH_COUNTRIES.NORTH_AMERICA.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>South America</SelectLabel>
                        {BIRTH_COUNTRIES.SOUTH_AMERICA.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Oceania</SelectLabel>
                        {BIRTH_COUNTRIES.OCEANIA.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="placeOfBirth.city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="city">City of birth</FieldLabel>
                  <Input
                    {...field}
                    type="text"
                    id="city"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your city"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <CardFooter>
            <Button type="submit" disabled={form.formState.disabled}>
              Submit
            </Button>
          </CardFooter>
        </CardContent>
      </form>
    </Card>
  );
}
