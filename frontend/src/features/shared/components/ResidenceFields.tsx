import { type Control } from "react-hook-form";
import type { OnboardHelperCommand } from "../../onboard-helper/OnboardHelper.types";
import { FRENCH_COUNTIES } from "../constants/counties";
import { RESIDENCE_COUNTRIES } from "../constants/countries";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResidenceFieldsProps {
  control: Control<OnboardHelperCommand>;
  countryOfResidence?: string;
}

export function ResidenceFields({
  control,
  countryOfResidence,
}: ResidenceFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="residence.country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country of Residence</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger data-testid="residence-country-select">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {RESIDENCE_COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {countryOfResidence === "FR" && (
        <FormField
          control={control}
          name="residence.frenchAreaCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>French County</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="residence-area-code-select">
                    <SelectValue placeholder="Select an area code" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Metropolitan France</SelectLabel>
                    {FRENCH_COUNTIES.METROPOLITAN.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Corsica</SelectLabel>
                    {FRENCH_COUNTIES.CORSICA.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Overseas</SelectLabel>
                    {FRENCH_COUNTIES.OVERSEAS.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
