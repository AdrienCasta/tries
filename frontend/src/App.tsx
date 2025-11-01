import RegisterHelperPage from "./features/register-helper/RegisterHelper.page";
import SignupPage from "./features/signup/Signup.page";
import EmailVerificationPage from "./features/email-verification/EmailVerification.page";

function App() {
  const path = window.location.pathname;

  if (path === "/signup") {
    return <SignupPage />;
  }

  if (path === "/verify-email") {
    return <EmailVerificationPage />;
  }

  return <RegisterHelperPage />;
}

export default App;
