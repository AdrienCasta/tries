import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerHelperSchema } from "./RegisterHelper.schema";
import { Controller, useForm, useWatch } from "react-hook-form";
import type z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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
import { RESIDENCE_COUNTRIES } from "../shared/constants/countries";
import { Textarea } from "@/components/ui/textarea";
import { FRENCH_AREAS } from "../shared/constants/frenchAreas";
import { useProfessions } from "../shared/hooks/useProfessions";
import { ProfessionSelector } from "../shared/components/ProfessionSelector";

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
  professions: string[];
  rppsNumbers: Record<string, string>;
  credentialFiles?: Record<string, File>;
  residence: {
    country: string;
    frenchAreaCode?: string;
  };
  experienceSummary: string;
  criminalRecordCertificate?: File;
}

type RegisterHelperFormProps = {
  onSubmit: (data: z.infer<typeof registerHelperSchema>) => void;
};

export default function RegisterHelperForm({
  onSubmit,
}: RegisterHelperFormProps) {
  const form = useForm<z.infer<typeof registerHelperSchema>>({
    resolver: zodResolver(registerHelperSchema),
    defaultValues: {
      email: "",
      firstname: "",
      password: "",
      birthdate: "",
      phoneNumber: "",
      professions: [],
      rppsNumbers: {},
      experienceSummary: "",
      placeOfBirth: {
        country: "",
        city: "",
      },
      residence: {
        country: "",
        frenchAreaCode: "",
      },
    },
  });

  const residenceCountry = useWatch({
    control: form.control,
    name: "residence.country",
  });

  const selectedProfessions =
    useWatch({
      control: form.control,
      name: "professions",
    }) || [];

  const { availableProfessions, handleAddProfession, handleRemoveProfession } =
    useProfessions({
      form: form as any,
      selectedProfessions,
    });

  return (
    <Form {...form}>
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Signup to Tries</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                      placeholder="name@example.com"
                    />
                    <FieldDescription>
                      You'll use this to log in.
                    </FieldDescription>
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
                    <FieldDescription>
                      Must be at least 8 characters, including a capital letter,
                      a number and a special character.
                    </FieldDescription>
                  </Field>
                )}
              />
              <Controller
                name="firstname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstname">First name</FieldLabel>
                    <Input
                      {...field}
                      id="firstname"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g., Jane"
                    />
                    <FieldDescription>
                      Please enter your legal first name.
                    </FieldDescription>
                  </Field>
                )}
              />
              <Controller
                name="lastname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastname">Last name</FieldLabel>
                    <Input
                      {...field}
                      id="lastname"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g., Doe"
                    />
                    <FieldDescription>
                      Please enter your legal last name.
                    </FieldDescription>
                  </Field>
                )}
              />
              <Controller
                name="birthdate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="birthdate">Birthdate</FieldLabel>
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
              <ProfessionSelector
                control={form.control as any}
                selectedProfessions={selectedProfessions}
                availableProfessions={availableProfessions}
                onAddProfession={handleAddProfession}
                onRemoveProfession={handleRemoveProfession}
              />
              <FieldSet>
                <FieldLegend>Current location</FieldLegend>
                <Controller
                  name="residence.country"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="residence.country">
                        Current country
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger
                          id="residence.country"
                          aria-label="Current country"
                        >
                          <SelectValue placeholder="e.g., France" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Europe</SelectLabel>
                            {RESIDENCE_COUNTRIES.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                {residenceCountry === "FR" && (
                  <Controller
                    name="residence.frenchAreaCode"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="residence.frenchAreaCode">
                          French County
                        </FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger
                            id="residence.frenchAreaCode"
                            aria-label="French County"
                          >
                            <SelectValue placeholder="Select an area code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Metropolitan France</SelectLabel>
                              {FRENCH_AREAS.METROPOLITAN.map((county) => (
                                <SelectItem key={county} value={county}>
                                  {county}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Corsica</SelectLabel>
                              {FRENCH_AREAS.CORSICA.map((county) => (
                                <SelectItem key={county} value={county}>
                                  {county}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Overseas</SelectLabel>
                              {FRENCH_AREAS.OVERSEAS.map((county) => (
                                <SelectItem key={county} value={county}>
                                  {county}
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
                )}
                <Controller
                  name="experienceSummary"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="experienceSummary">
                        Relevant Sports/Clinical Experience
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="experienceSummary"
                        aria-invalid={fieldState.invalid}
                        placeholder="List your current role, team/clinic, and specializations (e.g., Head Athletic Trainer, Pro Soccer Team, 5 years exp in injury rehab)."
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldSet>
            </FieldGroup>
            <CardFooter>
              <Button type="submit" disabled={form.formState.disabled}>
                Submit
              </Button>
            </CardFooter>
          </CardContent>
        </form>
      </Card>
    </Form>
  );
}
