import { Routes, Route } from "react-router-dom";
import RegisterHelperPage from "./features/register-helper/RegisterHelper.page";
import SignupPage from "./features/signup/Signup.page";
import EmailVerificationPage from "./features/email-verification/EmailVerification.page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegisterHelperPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
    </Routes>
  );
}

export default App;
