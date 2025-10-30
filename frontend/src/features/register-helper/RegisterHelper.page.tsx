import { Toaster } from "@/components/ui/sonner";
import RegisterHelperForm from "./RegisterHelperForm";
import { useRegisterHelper } from "./RegisterHelper.hook";

export default function RegisterHelperPage() {
  const { onboard, isLoading } = useRegisterHelper();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Onboard Helper</h1>
        </div>
        <RegisterHelperForm onSubmit={onboard} isLoading={isLoading} />
      </div>
      <Toaster />
    </div>
  );
}
