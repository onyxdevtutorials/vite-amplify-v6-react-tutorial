import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";
import SignInConfirm from "./SignInConfirm";
import { AuthContextProvider, useAuthContext } from "../context/AuthContext";
import { useSignInContext } from "../context/SignInContext";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

vi.mock("../context/SignInContext", () => ({
  useSignInContext: vi.fn(() => ({
    signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
    setSignInStep: vi.fn(),
  })),
}));

vi.mock("../context/AuthContext", async () => {
  const actual = await import("../context/AuthContext");
  return {
    ...actual,
    useAuthContext: vi.fn(() => ({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    })),
  };
});

vi.mock("aws-amplify/auth");

const renderWithAuthContext = (component: ReactNode) => {
  return render(
    <MemoryRouter>
      <AuthContextProvider>{component}</AuthContextProvider>
    </MemoryRouter>
  );
};

describe("SignInConfirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the sign in confirm form", () => {
    vi.mocked(useSignInContext).mockReturnValueOnce({
      signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
      setSignInStep: vi.fn(),
    });

    renderWithAuthContext(<SignInConfirm />);

    expect(
      screen.getByRole("heading", { name: /please set a new password/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  test("user (not an admin) fills out and successfully submits the confirm sign in form", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.confirmSignIn).mockResolvedValueOnce({
      isSignedIn: true,
      nextStep: {
        signInStep: "DONE",
      },
    });

    vi.mocked(awsAmplifyAuth.fetchAuthSession).mockResolvedValueOnce({
      tokens: {
        accessToken: {
          payload: {},
        },
      },
    });

    // Tests fail if we use mockReturnValueOnce with useSignInContext
    vi.mocked(useSignInContext).mockReturnValue({
      signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
      setSignInStep: vi.fn(),
    });

    // Tests fail if we use mockReturnValueOnce with useAuthContext
    vi.mocked(useAuthContext).mockReturnValue({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<SignInConfirm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });

    await user.type(passwordInput, "newpassword");

    await user.click(submitButton);

    expect(awsAmplifyAuth.confirmSignIn).toHaveBeenCalledWith({
      challengeResponse: "newpassword",
    });

    expect(useAuthContext().setIsLoggedIn).toHaveBeenCalledWith(true);

    expect(useSignInContext().setSignInStep).toHaveBeenCalledWith("DONE");
  });

  test("submits the form without filling in a new password", async () => {
    const user = userEvent.setup();

    vi.mocked(useSignInContext).mockReturnValueOnce({
      signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
      setSignInStep: vi.fn(),
    });

    renderWithAuthContext(<SignInConfirm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const passwordInputFeedback = passwordInput.nextSibling;
    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });

    await user.click(submitButton);
    expect(passwordInput).toHaveClass("is-invalid");
    expect(passwordInputFeedback).toHaveTextContent("Required");
  });

  test("user (an admin) fills out and successfully submits the confirm sign in form", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.confirmSignIn).mockResolvedValueOnce({
      isSignedIn: true,
      nextStep: {
        signInStep: "DONE",
      },
    });

    vi.mocked(awsAmplifyAuth.fetchAuthSession).mockResolvedValueOnce({
      tokens: {
        accessToken: {
          payload: {
            "cognito:groups": ["admin"],
          },
        },
      },
    });

    vi.mocked(useSignInContext).mockReturnValueOnce({
      signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
      setSignInStep: vi.fn(),
    });

    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<SignInConfirm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });

    await user.type(passwordInput, "newpassword");

    await user.click(submitButton);

    expect(awsAmplifyAuth.confirmSignIn).toHaveBeenCalledWith({
      challengeResponse: "newpassword",
    });

    expect(useAuthContext().setIsLoggedIn).toHaveBeenCalledWith(true);

    expect(useSignInContext().setSignInStep).toHaveBeenCalledWith("DONE");

    expect(useAuthContext().setIsAdmin).toHaveBeenCalledWith(true);
  });
});
