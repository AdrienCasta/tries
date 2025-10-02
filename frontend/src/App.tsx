import { OnboardHelperForm } from "./components/OnboardHelperForm";
import React from "react";

function App() {
  const [userOnboarded, setUserOnboarded] = React.useState(false);

  if (userOnboarded) {
    return <p>User onboarded</p>;
  }

  return (
    <>
      <OnboardHelperForm
        onSubmit={() => {
          setUserOnboarded(true);
        }}
      />
    </>
  );
}

export default App;
