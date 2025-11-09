import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { profileCompletionSchema, type ProfileCompletionCommand } from "./ProfileCompletion.schema";
import { useProfileCompletion } from "./useProfileCompletion";

interface ProfileCompletionDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileCompletionDialog({ open, onClose }: ProfileCompletionDialogProps) {
  const { completeProfile, skipCompletion, isLoading } = useProfileCompletion();

  const form = useForm<ProfileCompletionCommand>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
    },
  });

  const onSubmit = async (data: ProfileCompletionCommand) => {
    await completeProfile(data);
    onClose();
  };

  const handleSkip = () => {
    skipCompletion();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compléter votre profil</DialogTitle>
          <DialogDescription>
            Ajoutez vos informations personnelles pour compléter votre profil.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="firstname"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstname">Prénom</FieldLabel>
                  <Input
                    {...field}
                    type="text"
                    id="firstname"
                    aria-invalid={fieldState.invalid}
                    placeholder="Jean"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="lastname"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="lastname">Nom</FieldLabel>
                  <Input
                    {...field}
                    type="text"
                    id="lastname"
                    aria-invalid={fieldState.invalid}
                    placeholder="Dupont"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Passer pour le moment
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Compléter le profil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
