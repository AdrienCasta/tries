import RegisterHelperPage from "./features/register-helper/RegisterHelper.page";
import SignupPage from "./features/signup/Signup.page";

function App() {
  const path = window.location.pathname;

  if (path === "/signup") {
    return <SignupPage />;
  }

  return <RegisterHelperPage />;
}

export default App;
