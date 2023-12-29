import { describe, test, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthContextProvider, useAuthContext } from "./AuthContext";
import userEvent from "@testing-library/user-event";

const TestComponent: React.FC = () => {
  const {
    isLoggedIn,
    setIsLoggedIn,
    signInStep,
    setSignInStep,
    isAdmin,
    setIsAdmin,
  } = useAuthContext();

  return (
    <>
      <div data-testid="isLoggedIn">
        isLoggedIn: {isLoggedIn ? "true" : "false"}
      </div>
      <div data-testid="signInStep">signInStep: {signInStep}</div>
      <div data-testid="isAdmin">isAdmin: {isAdmin ? "true" : "false"}</div>
      <div>
        <button onClick={() => setIsLoggedIn(true)}>setIsLoggedIn</button>
        <button onClick={() => setSignInStep("this step")}>
          setSignInStep
        </button>
        <button onClick={() => setIsAdmin(true)}>setIsAdmin</button>
      </div>
    </>
  );
};
describe("AuthContext", () => {
  test.only("should provide the AuthContext values correctly", async () => {
    const user = userEvent.setup();

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    const setIsLoggedInButton = screen.getByRole("button", {
      name: /setIsLoggedIn/i,
    });

    const setSignInStepButton = screen.getByRole("button", {
      name: /setSignInStep/i,
    });

    const setIsAdminButton = screen.getByRole("button", {
      name: /setIsAdmin/i,
    });

    expect(setIsLoggedInButton).toBeInTheDocument();

    await user.click(setIsLoggedInButton);

    const isLoggedIn = screen.getByTestId("isLoggedIn");

    expect(isLoggedIn).toHaveTextContent("isLoggedIn: true");

    await user.click(setSignInStepButton);

    const signInStep = screen.getByTestId("signInStep");

    expect(signInStep).toHaveTextContent("signInStep: this step");

    await user.click(setIsAdminButton);

    const isAdmin = screen.getByTestId("isAdmin");

    expect(isAdmin).toHaveTextContent("isAdmin: true");
  });
});
