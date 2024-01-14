import { describe, test, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthContextProvider, useAuthContext } from "./AuthContext";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";

vi.mock("aws-amplify/auth");

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() };
});

vi.mock("react-router-dom", async () => {
  const router = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...router,
    useNavigate: vi.fn().mockReturnValue(mockNavigate),
  };
});

const TestComponent: React.FC = () => {
  const {
    isLoggedIn,
    signInStep,
    setSignInStep,
    isAdmin,
    user,
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    confirmSignIn,
  } = useAuthContext();

  return (
    <>
      <div data-testid="isLoggedIn">
        isLoggedIn: {isLoggedIn ? "true" : "false"}
      </div>
      <div data-testid="signInStep">signInStep: {signInStep}</div>
      <div data-testid="isAdmin">isAdmin: {isAdmin ? "true" : "false"}</div>
      <div data-testid="user">username: {user?.username}</div>
      <div>
        <button
          onClick={() =>
            signIn(
              { username: "testuser", password: "testpassword" },
              mockNavigate
            )
          }
        >
          Sign In
        </button>
        <button onClick={() => signOut(mockNavigate)}>Sign Out</button>
        <button
          onClick={() =>
            signUp(
              {
                username: "testuser",
                password: "testpassword",
                email: "test@test.com",
              },
              mockNavigate
            )
          }
        >
          Sign Up
        </button>
        <button
          onClick={() =>
            confirmSignUp(
              { username: "testuser", confirmationCode: "123456" },
              mockNavigate
            )
          }
        >
          Confirm Sign Up
        </button>
        <button
          onClick={() =>
            confirmSignIn({ challengeResponse: "xyz" }, mockNavigate)
          }
        >
          Confirm Sign In
        </button>
        <button onClick={() => setSignInStep("this step")}>
          setSignInStep
        </button>
      </div>
    </>
  );
};
describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );
  });
  test("should call AWS signIn with correct values for the case where confirmation (password change) is not required (user is not admin)", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValueOnce({
      nextStep: {
        signInStep: "DONE",
      },
      isSignedIn: true,
    });

    const isAdminStatus = screen.getByTestId("isAdmin");
    const signedInStatus = screen.getByTestId("isLoggedIn");
    const signInButton = screen.getByRole("button", { name: "Sign In" });
    const signOutButton = screen.getByRole("button", { name: "Sign Out" });
    const signUpButton = screen.getByRole("button", { name: "Sign Up" });
    const confirmSignUpButton = screen.getByRole("button", {
      name: "Confirm Sign Up",
    });
    const confirmSignInButton = screen.getByRole("button", {
      name: "Confirm Sign In",
    });
    const setSignInStepButton = screen.getByRole("button", {
      name: "setSignInStep",
    });

    expect(signedInStatus).toHaveTextContent("isLoggedIn: false");

    expect(isAdminStatus).toHaveTextContent("isAdmin: false");

    expect(signInButton).toBeInTheDocument();

    await user.click(signInButton);

    expect(awsAmplifyAuth.signIn).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
    });

    expect(signedInStatus).toHaveTextContent("isLoggedIn: true");

    expect(isAdminStatus).toHaveTextContent("isAdmin: false");
  });
  test("should call AWS confirmSignIn with correct values and navigate to /confirmsignin when signInStep is CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValueOnce({
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
      },
      isSignedIn: true,
    });

    vi.mocked(awsAmplifyAuth.confirmSignIn).mockResolvedValueOnce({
      nextStep: {
        signInStep: "DONE",
      },
      isSignedIn: true,
    });

    const isSignedInStatus = screen.getByTestId("isLoggedIn");
    const isAdminStatus = screen.getByTestId("isAdmin");

    expect(isSignedInStatus).toHaveTextContent("isLoggedIn: true");
    expect(isAdminStatus).toHaveTextContent("isAdmin: false");

    const confirmSignInButton = screen.getByRole("button", {
      name: "Confirm Sign In",
    });

    expect(confirmSignInButton).toBeInTheDocument();

    await user.click(confirmSignInButton);

    expect(isSignedInStatus).toHaveTextContent("isLoggedIn: true");
    expect(isAdminStatus).toHaveTextContent("isAdmin: false");

    expect(awsAmplifyAuth.confirmSignIn).toHaveBeenCalledWith({
      challengeResponse: "xyz",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
  test("should call AWS signUp with correct values and then call navigate with /signupconfirm/${username}", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signUp).mockResolvedValueOnce({
      nextStep: {
        signUpStep: "CONFIRM_SIGN_UP",
        codeDeliveryDetails: {
          attributeName: "email",
          deliveryMedium: "EMAIL",
          destination: "test@test.com",
        },
      },
      isSignUpComplete: false,
    });

    const signUpButton = screen.getByRole("button", { name: "Sign Up" });

    expect(signUpButton).toBeInTheDocument();

    await user.click(signUpButton);

    expect(awsAmplifyAuth.signUp).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
      options: {
        userAttributes: {
          email: "test@test.com",
        },
        autoSignIn: true,
      },
    });
  });
  test("should call AWS confirmSignUp with correct values and then call navigate with /", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.confirmSignUp).mockResolvedValueOnce({
      isSignUpComplete: true,
      nextStep: {
        signUpStep: "DONE",
      },
    });

    const confirmSignUpButton = screen.getByRole("button", {
      name: "Confirm Sign Up",
    });

    expect(confirmSignUpButton).toBeInTheDocument();

    await user.click(confirmSignUpButton);

    expect(awsAmplifyAuth.confirmSignUp).toHaveBeenCalledWith({
      username: "testuser",
      confirmationCode: "123456",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
  test("should call AWS signOut with correct values and then call navigate with /", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signOut).mockResolvedValueOnce(undefined);

    const signOutButton = screen.getByRole("button", { name: "Sign Out" });

    expect(signOutButton).toBeInTheDocument();

    await user.click(signOutButton);

    expect(awsAmplifyAuth.signOut).toHaveBeenCalledWith();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
