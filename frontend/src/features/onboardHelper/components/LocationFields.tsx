import { type Control } from "react-hook-form";
import type { OnboardHelperCommand } from "../types/OnboardHelperForm.types";
import { FRENCH_COUNTIES } from "../constants/frenchCounties";
import { RESIDENCE_COUNTRIES } from "../constants/residenceCountries";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LocationFieldsProps {
  control: Control<OnboardHelperCommand>;
  countryOfResidence?: string;
}

export function LocationFields({
  control,
  countryOfResidence,
}: LocationFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="countryOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country of birth</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
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
        name="city-of-birth"
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

      <FormField
        control={control}
        name="city-of-birth-zip-code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Zip code</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="countryOfResidence"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country of Residence</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
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
          name="frenchCounty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>French County</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
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
