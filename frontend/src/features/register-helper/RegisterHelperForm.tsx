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
          <CardTitle>Inscription à Tries</CardTitle>
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
                      placeholder="nom@exemple.com"
                    />
                    <FieldDescription>
                      Vous l'utiliserez pour vous connecter.
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
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      id="password"
                      aria-invalid={fieldState.invalid}
                      placeholder="Entrez votre mot de passe"
                    />
                    <FieldDescription>
                      Doit contenir au moins 8 caractères, incluant une majuscule,
                      un chiffre et un caractère spécial.
                    </FieldDescription>
                  </Field>
                )}
              />
              <Controller
                name="firstname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstname">Prénom</FieldLabel>
                    <Input
                      {...field}
                      id="firstname"
                      aria-invalid={fieldState.invalid}
                      placeholder="ex : Jean"
                    />
                    <FieldDescription>
                      Veuillez entrer votre prénom légal.
                    </FieldDescription>
                  </Field>
                )}
              />
              <Controller
                name="lastname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastname">Nom</FieldLabel>
                    <Input
                      {...field}
                      id="lastname"
                      aria-invalid={fieldState.invalid}
                      placeholder="ex : Dupont"
                    />
                    <FieldDescription>
                      Veuillez entrer votre nom légal.
                    </FieldDescription>
                  </Field>
                )}
              />
              <Controller
                name="birthdate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="birthdate">Date de naissance</FieldLabel>
                    <Input
                      {...field}
                      type="date"
                      id="birthdate"
                      aria-invalid={fieldState.invalid}
                      placeholder="Entrez votre date de naissance"
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
                    <FieldLabel htmlFor="phoneNumber">Numéro de téléphone</FieldLabel>
                    <Input
                      {...field}
                      type="tel"
                      id="phoneNumber"
                      aria-invalid={fieldState.invalid}
                      placeholder="Entrez votre numéro de téléphone"
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
                    <FieldLabel htmlFor="country">Pays de naissance</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger id="country" aria-label="Country of birth" data-testid="place-of-birth-country-select">
                        <SelectValue placeholder="Sélectionner un pays" />
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
                          <SelectLabel>Afrique</SelectLabel>
                          {BIRTH_COUNTRIES.AFRICA.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Asie</SelectLabel>
                          {BIRTH_COUNTRIES.ASIA.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Amérique du Nord</SelectLabel>
                          {BIRTH_COUNTRIES.NORTH_AMERICA.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Amérique du Sud</SelectLabel>
                          {BIRTH_COUNTRIES.SOUTH_AMERICA.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Océanie</SelectLabel>
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
                    <FieldLabel htmlFor="city">Ville de naissance</FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      id="city"
                      aria-invalid={fieldState.invalid}
                      placeholder="Entrez votre ville"
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
                <FieldLegend>Localisation actuelle</FieldLegend>
                <Controller
                  name="residence.country"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="residence.country">
                        Pays actuel
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger
                          id="residence.country"
                          aria-label="Current country"
                          data-testid="residence-country-select"
                        >
                          <SelectValue placeholder="ex : France" />
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
                          Département français
                        </FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger
                            id="residence.frenchAreaCode"
                            aria-label="French County"
                            data-testid="residence-area-code-select"
                          >
                            <SelectValue placeholder="Sélectionner un département" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>France métropolitaine</SelectLabel>
                              {FRENCH_AREAS.METROPOLITAN.map((county) => (
                                <SelectItem key={county} value={county}>
                                  {county}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Corse</SelectLabel>
                              {FRENCH_AREAS.CORSICA.map((county) => (
                                <SelectItem key={county} value={county}>
                                  {county}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>Outre-mer</SelectLabel>
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
              </FieldSet>
            </FieldGroup>
            <CardFooter>
              <Button type="submit" disabled={form.formState.disabled}>
                Inscrire l'aidant
              </Button>
            </CardFooter>
          </CardContent>
        </form>
      </Card>
    </Form>
  );
}
