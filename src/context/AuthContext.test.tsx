import { describe, test, expect, vi, beforeEach } from "vitest";
import React, { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { AuthContextProvider, useAuthContext } from "./AuthContext";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";
import { toast } from "react-toastify";

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

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

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
    resetAuthState,
  } = useAuthContext();

  useEffect(() => {
    resetAuthState();
  }, []);

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
                email: "testuser@test.com",
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
  test("should call toast with error message if AWS signIn throws an error", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signIn).mockRejectedValueOnce({
      message: "Incorrect username or password.",
    });

    const isAdminStatus = screen.getByTestId("isAdmin");
    const signedInStatus = screen.getByTestId("isLoggedIn");
    const signInButton = screen.getByRole("button", { name: "Sign In" });

    expect(signedInStatus).toHaveTextContent("isLoggedIn: false");

    expect(isAdminStatus).toHaveTextContent("isAdmin: false");

    expect(signInButton).toBeInTheDocument();

    await user.click(signInButton);

    expect(awsAmplifyAuth.signIn).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/^There was a problem signing you in:/)
    );
  });
  test("should navigate to /confirmsignin when signIn returns signInStep as CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValueOnce({
      nextStep: {
        signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
      },
      isSignedIn: false,
    });

    const isSignedInStatus = screen.getByTestId("isLoggedIn");
    const isAdminStatus = screen.getByTestId("isAdmin");

    expect(isSignedInStatus).toHaveTextContent("isLoggedIn: false");
    expect(isAdminStatus).toHaveTextContent("isAdmin: false");

    const signInButton = screen.getByRole("button", { name: "Sign In" });
    expect(signInButton).toBeInTheDocument();

    await user.click(signInButton);

    expect(isSignedInStatus).toHaveTextContent("isLoggedIn: false");
    expect(isAdminStatus).toHaveTextContent("isAdmin: false");

    expect(mockNavigate).toHaveBeenCalledWith("/signinconfirm");
  });
  test("should call AWS confirmSignIn with correct values and then call navigate with /", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.confirmSignIn).mockResolvedValueOnce({
      isSignedIn: true,
      nextStep: {
        signInStep: "DONE",
      },
    });

    const confirmSignInButton = screen.getByRole("button", {
      name: "Confirm Sign In",
    });

    expect(confirmSignInButton).toBeInTheDocument();

    await user.click(confirmSignInButton);

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
          destination: "testuser@test.com",
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
          email: "testuser@test.com",
        },
        autoSignIn: true,
      },
    });
  });
  test("should call toast with error message if AWS signUp throws an error", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signUp).mockRejectedValueOnce({
      message: "some unknown error.",
    });

    const signUpButton = screen.getByRole("button", { name: "Sign Up" });

    expect(signUpButton).toBeInTheDocument();

    await user.click(signUpButton);

    expect(awsAmplifyAuth.signUp).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
      options: {
        userAttributes: {
          email: "testuser@test.com",
        },
        autoSignIn: true,
      },
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/^There was a problem signing you up:/)
    );
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
  test("should call toast with error message if AWS confirmSignUp throws an error", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.confirmSignUp).mockRejectedValueOnce({
      message: "some unknown error.",
    });

    const confirmSignUpButton = screen.getByRole("button", {
      name: "Confirm Sign Up",
    });
    await user.click(confirmSignUpButton);

    expect(awsAmplifyAuth.confirmSignUp).toHaveBeenCalledWith({
      username: "testuser",
      confirmationCode: "123456",
    });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/^There was a problem confirming your sign up/i)
    );
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
  test("should call AWS signIn for user as admin, causing isAdmin to be set to true", async () => {
    const user = userEvent.setup();
    vi.mocked(awsAmplifyAuth.fetchAuthSession).mockResolvedValueOnce({
      tokens: {
        accessToken: {
          payload: {
            "cognito:groups": ["admin"],
          },
        },
      },
    });
    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValueOnce({
      nextStep: {
        signInStep: "DONE",
      },
      isSignedIn: true,
    });

    const isAdminStatus = screen.getByTestId("isAdmin");
    const signedInStatus = screen.getByTestId("isLoggedIn");
    const signInButton = screen.getByRole("button", { name: "Sign In" });

    expect(signedInStatus).toHaveTextContent("isLoggedIn: false");

    expect(isAdminStatus).toHaveTextContent("isAdmin: false");

    expect(signInButton).toBeInTheDocument();

    await user.click(signInButton);

    expect(awsAmplifyAuth.signIn).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
    });

    expect(signedInStatus).toHaveTextContent("isLoggedIn: true");

    expect(isAdminStatus).toHaveTextContent("isAdmin: true");
  });
});
