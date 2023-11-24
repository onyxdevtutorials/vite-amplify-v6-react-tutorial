import { signIn, SignInInput } from "aws-amplify/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialState = { username: "", password: "" };

const SignIn = () => {
  const [formState, setFormState] = useState(initialState);

  async function handleSignIn({ username, password }: SignInInput) {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      console.log("isSignedIn", isSignedIn);
      console.log("nextStep", nextStep);
      navigate("/");
    } catch (error) {
      console.log("error signing in", error);
    }
  }

  const navigate = useNavigate();

  const setInput = (key: string, value: string) => {
    setFormState({ ...formState, [key]: value });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    handleSignIn(formState);
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            value={formState.username}
            onChange={(e) => setInput("username", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="username">Password</label>
          <input
            type="password"
            name="password"
            value={formState.password}
            onChange={(e) => setInput("password", e.target.value)}
          />
        </div>
        <div>
          <button type="submit">Sign In</button>
        </div>
      </form>
    </div>
  );
};
export default SignIn;
