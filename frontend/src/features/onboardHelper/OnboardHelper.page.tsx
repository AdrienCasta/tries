import { Toaster } from "@/components/ui/sonner";
import { OnboardHelperForm } from "./components/OnboardHelperForm";
import type { OnboardHelperFormData } from "./types/OnboardHelperForm.types";
import { toast } from "sonner";

export default function OnboardHelperPage() {
  const handleSubmit = async (data: OnboardHelperFormData) => {
    try {
      const response = await fetch("/api/helpers/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to onboard helper");
        return;
      }

      const result = await response.json();
      toast.success("user onboarded");
    } catch (error) {
      console.error("Error onboarding helper:", error);
      toast.error("System unavailable. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Onboard Helper</h1>
        </div>
        <OnboardHelperForm onSubmit={handleSubmit} />
      </div>
      <Toaster />
    </div>
  );
}
