import { useCallback, useMemo } from "react";
import { type UseFormReturn } from "react-hook-form";
import type { OnboardHelperCommand } from "../../onboard-helper/OnboardHelper.types";
import {
  VALID_PROFESSIONS,
  type ProfessionCode,
} from "../constants/professions";

interface UseProfessionsProps {
  form: UseFormReturn<OnboardHelperCommand>;
  selectedProfessions: string[];
}

export function useProfessions({
  form,
  selectedProfessions,
}: UseProfessionsProps) {
  const availableProfessions = useMemo(
    () =>
      VALID_PROFESSIONS.filter((p) => !selectedProfessions.includes(p.code)),
    [selectedProfessions]
  );

  const handleAddProfession = useCallback(
    (professionCode: ProfessionCode) => {
      const selectedProfessions = form.getValues("professions") || [];
      form.setValue("professions", [...selectedProfessions, professionCode]);

      const currentRpps = form.getValues("rppsNumbers") || {};
      form.setValue("rppsNumbers", { ...currentRpps, [professionCode]: "" });
    },
    [form]
  );

  const handleRemoveProfession = useCallback(
    (professionCode: ProfessionCode) => {
      const current = form.getValues("professions") || [];
      form.setValue(
        "professions",
        current.filter((p) => p !== professionCode),
        { shouldValidate: true }
      );

      const currentRpps = form.getValues("rppsNumbers") || {};
      const { [professionCode]: removed, ...remainingRpps } = currentRpps;
      form.setValue("rppsNumbers", remainingRpps, { shouldValidate: true });

      const currentFiles = form.getValues("credentialFiles") || {};
      const { [professionCode]: removedFile, ...remainingFiles } = currentFiles;
      form.setValue("credentialFiles", remainingFiles, { shouldValidate: true });
    },
    [form]
  );

  return {
    availableProfessions,
    handleAddProfession,
    handleRemoveProfession,
  };
}
