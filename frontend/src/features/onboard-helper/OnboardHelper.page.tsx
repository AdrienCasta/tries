import { Toaster } from "@/components/ui/sonner";
import { OnboardHelperForm } from "./RegisterHelperForm";
import { useOnboardHelper } from "./OnboardHelper.hook";

export default function OnboardHelperPage() {
  const { onboard, isLoading } = useOnboardHelper();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Onboard Helper</h1>
        </div>
        <OnboardHelperForm onSubmit={onboard} isLoading={isLoading} />
      </div>
      <Toaster />
    </div>
  );
}
