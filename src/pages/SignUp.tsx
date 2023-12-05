import { SignUpContextProvider } from "../context/SignUpContext";
import { SignUp as SignUpForm, ConfirmSignUp } from "../components";

const SignUp = () => {
  // const { signUpStep } = useSignUpContext();

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
