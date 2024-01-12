import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";
import SignIn from "./SignIn";
import { AuthContextProvider, useAuthContext } from "../context/AuthContext";
import { useSignInContext } from "../context/SignInContext";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

vi.mock("../context/SignInContext", () => ({
  useSignInContext: vi.fn(() => ({
    signInStep: null,
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

describe("SignIn component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders sign in form", () => {
    vi.mocked(useSignInContext).mockReturnValueOnce({
      signInStep: "",
      setSignInStep: vi.fn(),
    });

    renderWithAuthContext(<SignIn />);

    // Assert that the sign in form is rendered
    expect(
      screen.getByRole("textbox", { name: /^username$/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("user (not an admin) submits form with valid input", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValueOnce({
      nextStep: {
        signInStep: "DONE",
      },
      isSignedIn: true,
    });

    vi.mocked(awsAmplifyAuth.fetchAuthSession).mockResolvedValueOnce({
      tokens: {
        accessToken: {
          payload: {},
        },
      },
    });

    // Tests fail if we use mockReturnValueOnce with useSignInContext and useAuthContext

    vi.mocked(useSignInContext).mockReturnValue({
      signInStep: "",
      setSignInStep: vi.fn(),
    });

    vi.mocked(useAuthContext).mockReturnValue({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<SignIn />);

    const usernameInput = screen.getByRole("textbox", { name: /^username$/i });
    const passwordInput = screen.getByLabelText(/^password$/i);

    // Fill in the form fields
    await user.type(usernameInput, "testuser");

    await user.type(passwordInput, "testpassword");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValueOnce({
      nextStep: {
        signInStep: "DONE",
      },
      isSignedIn: true,
    });

    expect(awsAmplifyAuth.signIn).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
    });
    expect(awsAmplifyAuth.signIn).toHaveBeenCalledTimes(1);

    expect(useSignInContext().setSignInStep).toHaveBeenCalledWith("DONE");
    expect(useAuthContext().setIsLoggedIn).toHaveBeenCalledWith(true);
    expect(useAuthContext().setIsAdmin).toHaveBeenCalledWith(false);
  });

  test("displays error message with invalid input", async () => {
    vi.mocked(useSignInContext).mockReturnValueOnce({
      signInStep: "",
      setSignInStep: vi.fn(),
    });

    const user = userEvent.setup();

    renderWithAuthContext(<SignIn />);

    const usernameInput = screen.getByRole("textbox", { name: /^username$/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const usernameInputFeedback = usernameInput.nextSibling;
    const passwordInputFeedback = passwordInput.nextSibling;

    // Fill in the form fields with invalid input: empty strings

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(usernameInputFeedback).toHaveTextContent("Required");
    expect(passwordInputFeedback).toHaveTextContent("Required");
  });

  test("user signs in and is an admin", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValueOnce({
      nextStep: {
        signInStep: "DONE",
      },
      isSignedIn: true,
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
      signInStep: "",
      setSignInStep: vi.fn(),
    });

    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: true,
    });

    renderWithAuthContext(<SignIn />);

    const usernameInput = screen.getByRole("textbox", { name: /^username$/i });
    const passwordInput = screen.getByLabelText(/^password$/i);

    // Fill in the form fields
    await user.type(usernameInput, "testuser");

    await user.type(passwordInput, "testpassword");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(awsAmplifyAuth.signIn).toHaveBeenCalledWith({
        username: "testuser",
        password: "testpassword",
      });
      expect(awsAmplifyAuth.signIn).toHaveBeenCalledTimes(1);
    });

    // Wait for setIsAdmin to be called
    await waitFor(() => {
      expect(useAuthContext().setIsAdmin).toHaveBeenCalledWith(true);
    });
  });
});
