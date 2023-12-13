import { SignUpContextProvider } from "../context/SignUpContext";
import { SignUp as SignUpForm, SignUpConfirm } from "../components";
import { useAuthContext } from "../context/AuthContext";
import { useState } from "react";

const SignUp = () => {
  const { isLoggedIn } = useAuthContext();
  const [parentState, setParentState] = useState(false);

  const updateParentState = (value: boolean) => {
    setParentState(value);
  };

  if (isLoggedIn) {
    return (
      <p>
        You are signed in right now. If you want to sign up, you must first sign
        out.
      </p>
    );
  }

  return (
    <div>
      <SignUpContextProvider>
        {!parentState && <SignUpForm onStateUpdate={updateParentState} />}
        {parentState && <SignUpConfirm />}
      </SignUpContextProvider>
    </div>
  );
};
export default SignUp;
