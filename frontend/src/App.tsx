import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./features/auth/Auth.page";
import EmailVerificationPage from "./features/email-verification/EmailVerification.page";
import DashboardPage from "./features/dashboard/Dashboard.page";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
            -rfètgyjiopkl
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
