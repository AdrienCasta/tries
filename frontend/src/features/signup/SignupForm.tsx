import { Card, CardContent } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "./Signup.schema";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type SignupFormProps = {
  onSubmit: (data: z.infer<typeof signupSchema>) => void;
  isLoading: boolean;
};

export default function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      firstname: "",
      lastname: "",
    },
  });

  return (
    <Form {...form}>
      <div className="flex justify-center py-8">
        <img className="size-40" src="/tries.png" alt="" />
      </div>
      <Card className="w-full sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FieldGroup>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Créez votre compte</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Remplissez le formulaire ci-dessous pour créer votre compte
                </p>
              </div>
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
                      Entrez votre adresse email
                    </FieldDescription>
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading || form.formState.isSubmitting}
                >
                  {isLoading ? "Inscription en cours..." : "S'inscrire"}
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </form>
      </Card>
    </Form>
  );
}
