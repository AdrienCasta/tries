import { type Control } from "react-hook-form";
import type { OnboardHelperCommand } from "../../onboard-helper/OnboardHelper.types";
import { FRENCH_AREAS } from "../constants/frenchAreas";
import { RESIDENCE_COUNTRIES } from "../constants/countries";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlaceOfBirthFieldsProps {
  control: Control<OnboardHelperCommand>;
}

export function PlaceOfBirthFields({ control }: PlaceOfBirthFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="placeOfBirth.country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country of birth</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger data-testid="place-of-birth-country-select">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[{ code: "FR", value: "France" }].map(({ code, value }) => (
                  <SelectItem key={code} value={code}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="placeOfBirth.city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City of birth</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
