import { Toaster } from "@/components/ui/sonner";
import SignupForm from "./SignupForm";
import { useSignup } from "./Signup.hook";

export default function SignupPage() {
  const { signup, isLoading } = useSignup();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Sign Up</h1>
        </div>
        <SignupForm onSubmit={signup} isLoading={isLoading} />
      </div>
      <Toaster />
    </div>
  );
}
