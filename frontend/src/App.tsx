import { Routes, Route } from "react-router-dom";
import RegisterHelperPage from "./features/register-helper/RegisterHelper.page";
import SignupPage from "./features/signup/Signup.page";
import LoginPage from "./features/login/Login.page";
import EmailVerificationPage from "./features/email-verification/EmailVerification.page";
import DashboardPage from "./features/dashboard/Dashboard.page";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterHelperPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
