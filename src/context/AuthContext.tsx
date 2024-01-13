import React, { useState, useContext, createContext } from "react";
import useCheckForUser from "../hooks/useCheckForUser";
import {
  signIn as awsSignIn,
  signOut as awsSignOut,
  AuthError,
  AuthUser,
  SignInInput,
  fetchAuthSession,
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
  signOut: (navigate: NavigateFunction) => Promise<void>;
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
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );

  const signIn = async (values: SignInInput, navigate: NavigateFunction) => {
    const { username, password } = values;

    try {
      const { isSignedIn, nextStep } = await awsSignIn({ username, password });

      setSignInStep(nextStep.signInStep);
      setIsLoggedIn(isSignedIn);
      if (isSignedIn) {
        localStorage.setItem("isLoggedIn", "true");
        const isAdmin = await checkIsAdmin();
        setIsAdmin(isAdmin);
        if (isAdmin) {
          localStorage.setItem("isAdmin", "true");
        } else {
          localStorage.setItem("isAdmin", "false");
        }
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

  const signOut = async (navigate: NavigateFunction) => {
    try {
      await awsSignOut();
      setIsLoggedIn(false);
      setIsAdmin(false);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      navigate("/");
    } catch (error) {
      const authError = error as AuthError;
      toast.error(`There was a problem signing you out: ${authError.message}`);
      console.error("could not sign out", authError);
    }
  };

  const checkIsAdmin = async () => {
    let isAdmin = localStorage.getItem("isAdmin") === "true";

    try {
      const session = await fetchAuthSession();
      const tokens = session.tokens;
      if (tokens && Object.keys(tokens).length > 0) {
        const groups = tokens.accessToken.payload["cognito:groups"];
        if (groups && Array.isArray(groups) && groups.includes("admin")) {
          isAdmin = true;
        } else {
          isAdmin = false;
        }
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error(`Error checking admin status: ${authError.message}`);
    }

    return isAdmin;
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
        signOut,
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
