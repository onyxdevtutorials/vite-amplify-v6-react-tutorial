import { SignUpContextProvider } from "../context/SignUpContext";
import { SignUp as SignUpForm, ConfirmSignUp } from "../components";
import { useAuthContext } from "../context/AuthContext";

const SignUp = () => {
  const { isLoggedIn } = useAuthContext();

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
        <SignUpForm />
        <ConfirmSignUp />
      </SignUpContextProvider>
    </div>
  );
};
export default SignUp;
