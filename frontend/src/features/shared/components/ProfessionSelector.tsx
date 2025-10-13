import { type Control } from "react-hook-form";
import type { OnboardHelperCommand } from "../../onboard-helper/OnboardHelper.types";
import {
  VALID_PROFESSIONS,
  type ProfessionCode,
} from "../constants/professions";
import { Button } from "@/components/ui/button";
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

interface ProfessionSelectorProps {
  control: Control<OnboardHelperCommand>;
  selectedProfessions: string[];
  availableProfessions: typeof VALID_PROFESSIONS;
  onAddProfession: (code: ProfessionCode) => void;
  onRemoveProfession: (code: ProfessionCode) => void;
}

export function ProfessionSelector({
  control,
  selectedProfessions,
  availableProfessions,
  onAddProfession,
  onRemoveProfession,
}: ProfessionSelectorProps) {
  return (
    <FormField
      control={control}
      name="professions"
      render={() => (
        <FormItem>
          <FormLabel>Professions</FormLabel>

          {selectedProfessions.length > 0 && (
            <div className="space-y-4 mb-3">
              {selectedProfessions.map((code) => {
                const profession = VALID_PROFESSIONS.find(
                  (p) => p.code === code
                );
                if (!profession) return null;

                return (
                  <div
                    key={code}
                    className="flex flex-col gap-2 p-3 border rounded"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{profession.label}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onRemoveProfession(code as ProfessionCode)
                        }
                        aria-label={`Remove ${profession.label}`}
                      >
                        ×
                      </Button>
                    </div>
                    <FormField
                      control={control}
                      name={`rppsNumbers.${code}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            RPPS Number for {profession.label}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter RPPS number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {availableProfessions.length > 0 ? (
            <Select
              onValueChange={(value: string) =>
                onAddProfession(value as ProfessionCode)
              }
              value=""
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Add profession" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableProfessions.map((profession) => (
                  <SelectItem key={profession.code} value={profession.code}>
                    {profession.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              All professions have been selected
            </p>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
