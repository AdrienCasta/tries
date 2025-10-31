import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      password: "",
    },
  });

  return (
    <Form {...form}>
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
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
                      Enter your email address
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
                      Must be at least 8 characters with uppercase, number, and special character
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || form.formState.isSubmitting}>
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Form>
  );
}
