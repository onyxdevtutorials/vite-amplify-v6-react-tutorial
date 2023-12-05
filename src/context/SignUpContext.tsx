import React, { useState, useContext, createContext } from "react";

type SignUpProviderProps = {
  children: React.ReactNode;
};

type SignUpContext = {
  signUpStep: string;
  setSignUpStep: React.Dispatch<React.SetStateAction<string>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
};

const SignUpContext = createContext<SignUpContext | null>(null);

export const SignUpContextProvider: React.FC<SignUpProviderProps> = ({
  children,
}) => {
  const [signUpStep, setSignUpStep] = useState("");
  const [username, setUsername] = useState("");

  return (
    <SignUpContext.Provider
      value={{
        signUpStep,
        setSignUpStep,
        username,
        setUsername,
      }}
    >
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignUpContext = () => {
  const context = useContext(SignUpContext);

  if (!context) {
    throw new Error(
      "useSignUpContext must be used within SignUpContextProvider"
    );
  }

  return context;
};
