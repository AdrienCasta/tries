import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { ReactNode, useState, useEffect } from "react";
import ProfileCompletionDialog from "@/features/profile-completion/ProfileCompletionDialog";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.authState);
  console.log(user);
  const { status } = useAppSelector((state) => state.profileCompletion);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.profileStatus === "completed") {
        setShowDialog(false);
      } else if (status === "skipped" || status === "success") {
        setShowDialog(false);
      } else {
        setShowDialog(true);
      }
    } else {
      setShowDialog(false);
    }
  }, [isAuthenticated, user, status]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      {children}
      <ProfileCompletionDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
}
