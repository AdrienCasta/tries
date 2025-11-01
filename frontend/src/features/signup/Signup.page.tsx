import { Toaster } from "@/components/ui/sonner";
import SignupForm from "./SignupForm";
import { useSignup } from "./Signup.hook";

export default function SignupPage() {
  const { signup, isLoading } = useSignup();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm onSubmit={signup} isLoading={isLoading} />
      </div>
      <Toaster />
    </div>
  );
}
