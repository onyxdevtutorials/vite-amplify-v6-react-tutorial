import { useAuthContext } from "../context/AuthContext";
import { SignIn as SignInForm } from "../components";
import { ConfirmSignIn } from "../components";

const SignIn = () => {
  const { signInStep, isAdmin } = useAuthContext();

  return (
    <div>
      <h1>Sign In</h1>
      <p>Sign In Step: {signInStep}</p>
      <p>Are you an admin? {isAdmin ? "yes" : "no"}</p>

      {!signInStep && <SignInForm />}

      {signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED" && (
        <ConfirmSignIn />
      )}

      {signInStep === "DONE" && <p>You are signed in.</p>}
    </div>
  );
};
export default SignIn;
