import { useAuthContext } from "../context/AuthContext";
import { SignInContextProvider } from "../context/SignInContext";
import { SignIn as SignInForm } from "../components";
import { SignInConfirm } from "../components";

const SignIn = () => {
  const { isAdmin, isLoggedIn } = useAuthContext();

  if (isLoggedIn) {
    return <p>You are already signed in.</p>;
  }

  return (
    <>
      <h1>Sign In</h1>
      <p>Are you an admin? {isAdmin ? "yes" : "no"}</p>
      <SignInContextProvider>
        <SignInForm />

        <SignInConfirm />
      </SignInContextProvider>
    </>
  );
};
export default SignIn;
