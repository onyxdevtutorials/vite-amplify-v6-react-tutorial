import React, {
  useState,
  useContext,
  createContext,
  useCallback,
  useEffect,
} from "react";
import {
  signUp as awsSignUp,
  confirmSignUp as awsConfirmSignUp,
  signIn as awsSignIn,
  confirmSignIn as awsConfirmSignIn,
  signOut as awsSignOut,
  getCurrentUser,
  AuthError,
  AuthUser,
  SignInInput,
  fetchAuthSession,
  ConfirmSignUpInput,
  ConfirmSignInInput,
} from "aws-amplify/auth";
import { NavigateFunction } from "react-router-dom";
import { toast } from "react-toastify";

type AuthContextProviderProps = {
  children: React.ReactNode;
  initialAuthState?: AuthContextType;
};

type SignUpType = {
  username: string;
  password: string;
  email: string;
};

export type AuthContextType = {
  isLoggedIn: boolean;
  signInStep: string;
  setSignInStep: React.Dispatch<React.SetStateAction<string>>;
  isAdmin: boolean;
  user: AuthUser | null;
  checkUser: () => Promise<void>;
  signIn: (values: SignInInput, navigate: NavigateFunction) => Promise<void>;
  signOut: (navigate: NavigateFunction) => Promise<void>;
  signUp: (values: SignUpType, navigate: NavigateFunction) => Promise<void>;
  confirmSignUp: (
    values: ConfirmSignUpInput,
    navigate: NavigateFunction
  ) => Promise<void>;
  confirmSignIn: (
    values: ConfirmSignInInput,
    navigate: NavigateFunction
  ) => Promise<void>;
  resetAuthState: () => void;
  intendedPath?: string | null;
  setIntendedPath: React.Dispatch<React.SetStateAction<string | null>>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const defaultAuthState = {
  isLoggedIn: false,
  signInStep: "",
  setSignInStep: () => {},
  isAdmin: false,
  user: null,
  checkUser: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  confirmSignUp: async () => {},
  confirmSignIn: async () => {},
  resetAuthState: () => {},
  intendedPath: null,
  setIntendedPath: () => {},
};

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
  initialAuthState,
}) => {
  const defaultState = initialAuthState || defaultAuthState;
  const [user, setUser] = useState<AuthUser | null>(defaultState.user);
  const [signInStep, setSignInStep] = useState(defaultState.signInStep);
  const [isLoggedIn, setIsLoggedIn] = useState(
    initialAuthState?.isLoggedIn !== undefined
      ? initialAuthState.isLoggedIn
      : localStorage.getItem("isLoggedIn") === "true"
  );
  const [isAdmin, setIsAdmin] = useState(defaultState.isAdmin);
  const [intendedPath, setIntendedPath] = useState<string | null>(
    defaultState.intendedPath || null
  );

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setIsLoggedIn(true);
      setUser(currentUser);

      const isAdmin = await checkIsAdmin();
      setIsAdmin(isAdmin);
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const resetAuthState = () => {
    setSignInStep(defaultState.signInStep);
    setIsLoggedIn(defaultState.isLoggedIn);
    setIsAdmin(defaultState.isAdmin);
    localStorage.removeItem("isLoggedIn");
  };

  const signIn = async (values: SignInInput, navigate: NavigateFunction) => {
    const { username, password } = values;

    try {
      const result = await awsSignIn({ username, password });
      const isSignedIn = result.isSignedIn;
      const nextStep = result.nextStep;

      setSignInStep(nextStep.signInStep);
      setIsLoggedIn(isSignedIn);
      if (isSignedIn) {
        localStorage.setItem("isLoggedIn", "true");
        const isAdmin = await checkIsAdmin();
        setIsAdmin(isAdmin);
      } else {
        localStorage.setItem("isLoggedIn", "false");
      }

      if (nextStep.signInStep === "DONE") {
        toast.success("Sign in complete!");
        navigate("/");
      } else if (
        nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        toast.success("Please set a new password.");
        navigate("/signinconfirm");
      }
    } catch (error) {
      // NotAuthorizedException: Incorrect username or password.
      const authError = error as AuthError;
      setIsLoggedIn(false);
      toast.error(`There was a problem signing you in: ${authError.message}`);
      console.error("error signing in", error);
    }
  };

  const confirmSignIn = async (
    values: ConfirmSignInInput,
    navigate: NavigateFunction
  ) => {
    const { challengeResponse } = values;

    try {
      const { isSignedIn, nextStep } = await awsConfirmSignIn({
        challengeResponse: challengeResponse,
      });

      setIsLoggedIn(isSignedIn);
      setSignInStep(nextStep.signInStep);
      if (isSignedIn) {
        localStorage.setItem("isLoggedIn", "true");
        const isAdmin = await checkIsAdmin();
        setIsAdmin(isAdmin);
      }
      if (nextStep.signInStep === "DONE") {
        navigate("/");
      }
    } catch (error) {
      const authError = error as AuthError;
      setIsLoggedIn(false);
      toast.error(
        `There was a problem confirming your sign in: ${authError.message}`
      );
      console.error("error confirming sign in", error);
    }
  };

  const signOut = async (navigate: NavigateFunction) => {
    try {
      await awsSignOut();
      setIsLoggedIn(false);
      setIsAdmin(false);
      localStorage.removeItem("isLoggedIn");
      navigate("/");
    } catch (error) {
      const authError = error as AuthError;
      toast.error(`There was a problem signing you out: ${authError.message}`);
      console.error("could not sign out", authError);
    }
  };

  const signUp = async (values: SignUpType, navigate: NavigateFunction) => {
    const { username, password, email } = values;

    try {
      await awsSignUp({
        username: username,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
          autoSignIn: false,
        },
      });
      navigate(`/signupconfirm/${username}`);
    } catch (error) {
      console.error("could not sign up", error);
      if (error instanceof AuthError) {
        toast.error(`There was a problem signing you up: ${error.message}`);
      }
    }
  };

  const confirmSignUp = async (
    values: ConfirmSignUpInput,
    navigate: NavigateFunction
  ) => {
    try {
      const result = await awsConfirmSignUp({
        username: values.username,
        confirmationCode: values.confirmationCode,
      });

      if (result.isSignUpComplete) {
        toast.success("Sign up complete!");
        navigate("/signin");
      }
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(
          `There was a problem confirming your sign up: ${error.message}`
        );
      }
      console.error("error confirming sign up", error);
    }
  };

  const checkIsAdmin = async () => {
    let isAdmin = false;
    try {
      const session = await fetchAuthSession();
      const tokens = session.tokens;
      if (tokens && Object.keys(tokens).length > 0) {
        const groups = tokens.accessToken.payload["cognito:groups"];
        if (groups && Array.isArray(groups) && groups.includes("adminUsers")) {
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
        checkUser,
        signIn,
        signOut,
        signUp,
        confirmSignUp,
        confirmSignIn,
        resetAuthState,
        intendedPath,
        setIntendedPath,
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
