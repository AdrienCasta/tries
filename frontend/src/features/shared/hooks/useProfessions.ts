import { useCallback, useMemo } from "react";
import { type UseFormReturn } from "react-hook-form";
import { PROFESSIONS, type ProfessionCode } from "../constants/professions";

interface Profession {
  code: string;
  healthId: { rpps: string } | { adeli: string };
  credential?: {
    fileType: string;
    fileSize?: number;
  };
}

interface UseProfessionsProps {
  form: UseFormReturn<any>;
  selectedProfessions: Profession[];
}

export function useProfessions({
  form,
  selectedProfessions,
}: UseProfessionsProps) {
  const availableProfessions = useMemo(
    () => PROFESSIONS.filter((p) => !selectedProfessions.some(sp => sp.code === p.code)),
    [selectedProfessions]
  );

  const handleAddProfession = useCallback(
    (professionCode: ProfessionCode) => {
      const currentProfessions = form.getValues("professions") || [];
      const profession = PROFESSIONS.find(p => p.code === professionCode);

      const newProfession: Profession = {
        code: professionCode,
        healthId: profession?.heathIdType === "rpps"
          ? { rpps: "" }
          : { adeli: "" },
      };

      form.setValue("professions", [...currentProfessions, newProfession]);
    },
    [form]
  );

  const handleRemoveProfession = useCallback(
    (professionCode: ProfessionCode) => {
      const current = form.getValues("professions") || [];
      form.setValue(
        "professions",
        current.filter((p: Profession) => p.code !== professionCode),
        { shouldValidate: true }
      );
    },
    [form]
  );

  return {
    availableProfessions,
    handleAddProfession,
    handleRemoveProfession,
  };
}
