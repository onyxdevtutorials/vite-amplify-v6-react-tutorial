import { useState } from "react";
import { confirmSignUp, signUp } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

const initialState = {
  username: "",
  email: "",
  password: "",
  confirmationCode: "",
};

const SignUp = () => {
  const [formState, setFormState] = useState(initialState);
  const [signUpStep, setSignUpStep] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: formState.username,
        password: formState.password,
        options: {
          userAttributes: {
            email: formState.email,
          },
          autoSignIn: true,
        },
      });
      console.log("isSignUpComplete", isSignUpComplete);
      console.log("userId", userId);
      console.log("nextStep", nextStep);
      // nextStep = {codeDeliveryDetails: {}, signUpStep: "CONFIRM_SIGN_UP"}
      if (nextStep && nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        // show confirm dialog
        setSignUpStep(nextStep.signUpStep);
      } else {
        // tell user about error
      }
    } catch (error) {
      console.error("could not sign up", error);
    }
  };
  const handleSignUpConfirm: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: formState.username,
        confirmationCode: formState.confirmationCode,
      });
      console.log("isSignUpComplete", isSignUpComplete);
      console.log("nextStep", nextStep);

      if (isSignUpComplete) {
        navigate("/");
      }
    } catch (error) {
      console.error("error confirming sign up", error);
    }
  };

  const setInput = (key: string, value: string) => {
    setFormState({ ...formState, [key]: value });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSignUp();
  };

  const signUpForm = () => {
    return (
      <>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            onChange={(e) => setInput("username", e.target.value)}
            value={formState.username}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            onChange={(e) => setInput("password", e.target.value)}
            value={formState.password}
          />
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            onChange={(e) => setInput("email", e.target.value)}
            value={formState.email}
          />
          <button type="submit">Sign Up</button>
        </form>
      </>
    );
  };

  const signUpConfirmForm = () => {
    return (
      <>
        <h1>Confirm Sign Up</h1>
        <form onSubmit={handleSignUpConfirm}>
          <label htmlFor="confirmationCode">Username</label>
          <input
            type="text"
            name="confirmationCode"
            onChange={(e) => setInput("confirmationCode", e.target.value)}
            value={formState.confirmationCode}
          />
          <button type="submit">Submit</button>
        </form>
      </>
    );
  };

  return (
    <div>
      {!signUpStep && signUpForm()}
      {signUpStep === "CONFIRM_SIGN_UP" && signUpConfirmForm()}
    </div>
  );
};
export default SignUp;
