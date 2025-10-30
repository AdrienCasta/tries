import { type Control } from "react-hook-form";
import { useState } from "react";
import { PROFESSIONS, type ProfessionCode } from "../constants/professions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
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

interface Profession {
  code: string;
  healthId: { rpps: string } | { adeli: string };
  credential?: {
    fileType: string;
    fileSize?: number;
  };
}

interface ProfessionSelectorProps {
  control: Control<any>;
  selectedProfessions: Profession[];
  availableProfessions: typeof PROFESSIONS;
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
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  return (
    <FormField
      control={control}
      name="professions"
      render={() => (
        <FormItem>
          <FormLabel>Professions</FormLabel>

          {selectedProfessions.length > 0 && (
            <div className="space-y-4 mb-3">
              {selectedProfessions.map((selectedProf, index) => {
                const profession = PROFESSIONS.find((p) => p.code === selectedProf.code);
                if (!profession) return null;

                const hasRpps = "rpps" in selectedProf.healthId;

                return (
                  <div
                    key={selectedProf.code}
                    className="flex flex-col gap-2 p-3 border rounded"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{profession.label}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onRemoveProfession(selectedProf.code as ProfessionCode);
                          setFileNames((prev) => {
                            const newFileNames = { ...prev };
                            delete newFileNames[selectedProf.code];
                            return newFileNames;
                          });
                        }}
                        aria-label={`Remove ${profession.label}`}
                      >
                        ×
                      </Button>
                    </div>
                    <FormField
                      control={control}
                      name={hasRpps ? `professions.${index}.healthId.rpps` : `professions.${index}.healthId.adeli`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {hasRpps ? "RPPS" : "ADELI"} Number for {profession.label}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder={`Enter ${hasRpps ? "RPPS" : "ADELI"} number`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`professions.${index}.credential`}
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                          <FormLabel>
                            Credential File for {profession.label}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="application/pdf"
                              name={field.name}
                              ref={field.ref}
                              onBlur={field.onBlur}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange({
                                    fileType: file.type,
                                    fileSize: file.size,
                                  });
                                  setFileNames((prev) => ({
                                    ...prev,
                                    [selectedProf.code]: file.name,
                                  }));
                                }
                              }}
                            />
                          </FormControl>
                          {fileNames[selectedProf.code] && (
                            <p className="text-sm text-muted-foreground">
                              {fileNames[selectedProf.code]}
                            </p>
                          )}
                          <FormDescription>
                            Upload your credential to unlock full platform
                            access
                          </FormDescription>
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
                <SelectTrigger data-testid="profession-selector-add">
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
