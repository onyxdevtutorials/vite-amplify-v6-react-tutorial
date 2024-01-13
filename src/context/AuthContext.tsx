import React, { useState, useContext, createContext } from "react";
import useCheckForUser from "../hooks/useCheckForUser";
import useIsAdmin from "../hooks/useIsAdmin";
import {
  signIn as awsSignIn,
  AuthError,
  AuthUser,
  SignInInput,
} from "aws-amplify/auth";
import { NavigateFunction } from "react-router-dom";
import { toast } from "react-toastify";

type AuthContextProviderProps = {
  children: React.ReactNode;
};

export type AuthContextType = {
  isLoggedIn: boolean;
  signInStep: string;
  setSignInStep: React.Dispatch<React.SetStateAction<string>>;
  isAdmin: boolean;
  user: AuthUser | null;
  signIn: (values: SignInInput, navigate: NavigateFunction) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [signInStep, setSignInStep] = useState("");
  const { user } = useCheckForUser();
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const { isAdmin } = useIsAdmin();

  const signIn = async (values: SignInInput, navigate: NavigateFunction) => {
    const { username, password } = values;

    try {
      const { isSignedIn, nextStep } = await awsSignIn({ username, password });

      setSignInStep(nextStep.signInStep);
      setIsLoggedIn(isSignedIn);
      if (isSignedIn) {
        localStorage.setItem("isLoggedIn", "true");
      }
      if (nextStep.signInStep === "DONE") {
        navigate("/");
      }
    } catch (error) {
      // NotAuthorizedException: Incorrect username or password.
      const authError = error as AuthError;
      setIsLoggedIn(false);
      toast.error(`There was a problem signing you in: ${authError.message}`);
      console.error("error signing in", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        signInStep,
        setSignInStep,
        isAdmin,
        user,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthContextProvider");
  }

  return context;
};
