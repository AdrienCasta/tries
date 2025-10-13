import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { OnboardHelperFormData } from "../types/OnboardHelperForm.types";
import { onboardHelperSchema } from "../validators/schema";
import { useProfessions } from "../hooks/useProfessions";
import { ProfessionSelector } from "./ProfessionSelector";
import { LocationFields } from "./LocationFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface OnboardHelperFormProps {
  onSubmit?: (data: OnboardHelperFormData) => void;
}

export function OnboardHelperForm({ onSubmit }: OnboardHelperFormProps = {}) {
  const form = useForm<OnboardHelperFormData>({
    resolver: zodResolver(onboardHelperSchema),
    defaultValues: {
      email: "",
      firstname: "",
      lastname: "",
      phoneNumber: "",
      professions: [],
      rppsNumbers: {},
      birthdate: "",
      frenchCounty: "",
      countryOfBirth: "",
      countryOfResidence: "",
      professionalDescription: "",
    },
  });

  const countryOfResidence = useWatch({
    control: form.control,
    name: "countryOfResidence",
  });

  const selectedProfessions =
    useWatch({
      control: form.control,
      name: "professions",
    }) || [];

  const { availableProfessions, handleAddProfession, handleRemoveProfession } =
    useProfessions({ form, selectedProfessions });

  const handleFormSubmit = (data: OnboardHelperFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log(data);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        noValidate
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+33612345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ProfessionSelector
          control={form.control}
          selectedProfessions={selectedProfessions}
          availableProfessions={availableProfessions}
          onAddProfession={handleAddProfession}
          onRemoveProfession={handleRemoveProfession}
        />

        <FormField
          control={form.control}
          name="rppsNumbers"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthdate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birthdate</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LocationFields
          control={form.control}
          countryOfResidence={countryOfResidence}
        />

        <FormField
          control={form.control}
          name="professionalDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your professional experience, skills, and what makes you a great helper..."
                  className="min-h-[120px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Onboard Helper</Button>
      </form>
    </Form>
  );
}
