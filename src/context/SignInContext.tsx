import React, { useState, useContext, createContext } from "react";

type SignInProviderProps = {
  children: React.ReactNode;
};

type SignInContext = {
  signInStep: string;
  setSignInStep: React.Dispatch<React.SetStateAction<string>>;
};

const SignInContext = createContext<SignInContext | null>(null);

export const SignInContextProvider: React.FC<SignInProviderProps> = ({
  children,
}) => {
  const [signInStep, setSignInStep] = useState("");

  return (
    <SignInContext.Provider
      value={{
        signInStep,
        setSignInStep,
      }}
    >
      {children}
    </SignInContext.Provider>
  );
};

export const useSignInContext = () => {
  const context = useContext(SignInContext);

  if (!context) {
    throw new Error(
      "useSignInContext must be used within SignInContextProvider"
    );
  }

  return context;
};
