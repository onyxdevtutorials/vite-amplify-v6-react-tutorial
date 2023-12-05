import { useAuthContext } from "../context/AuthContext";
import { SignInContextProvider } from "../context/SignInContext";
import { SignIn as SignInForm } from "../components";
import { ConfirmSignIn } from "../components";

const SignIn = () => {
  const { isAdmin, isLoggedIn } = useAuthContext();

  return (
    <div>
      <h1>Sign In</h1>
      <p>Are you an admin? {isAdmin ? "yes" : "no"}</p>
      <SignInContextProvider>
        <SignInForm />

        <ConfirmSignIn />
      </SignInContextProvider>

      {/* {(signInStep === "DONE" || isLoggedIn) && <p>You are signed in.</p>} */}
    </div>
  );
};
export default SignIn;
