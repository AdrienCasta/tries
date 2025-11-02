import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./Login.schema";
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

type LoginFormProps = {
  onSubmit: (data: z.infer<typeof loginSchema>) => void;
  isLoading: boolean;
};

export default function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
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
                <h1 className="text-2xl font-bold">Connexion</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Entrez votre email pour recevoir un code OTP
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
                      Nous vous enverrons un code de vérification
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
                  {isLoading ? "Envoi en cours..." : "Recevoir le code OTP"}
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </form>
      </Card>
    </Form>
  );
}
