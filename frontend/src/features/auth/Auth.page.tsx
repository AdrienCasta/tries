import AuthForm from "./AuthForm";
import { useAuth } from "./Auth.hook";

export default function AuthPage() {
  const { authenticate, isLoading } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <AuthForm onSubmit={authenticate} isLoading={isLoading} />
    </div>
  );
}
