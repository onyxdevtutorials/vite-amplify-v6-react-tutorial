import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";
import SignIn from "./SignIn";
import {
  AuthContextProvider,
  useAuthContext,
  AuthContextType,
} from "../context/AuthContext";
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

describe("SignIn component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders sign in form", () => {
    render(<SignIn />);

    // Assert that the sign in form is rendered
    expect(
      screen.getByRole("textbox", { name: /^username$/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test.only("submits form with valid input", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValue({
      nextStep: {
        signInStep: "DONE",
      },
      isSignedIn: true,
    });

    vi.mocked(awsAmplifyAuth.fetchAuthSession).mockResolvedValue({
      tokens: {
        accessToken: {
          payload: {
            "cognito:groups": ["admin"],
          },
        },
      },
    });

    const renderWithAuthContext = (component: ReactNode) => {
      const mockAuthValue = {
        setIsLoggedIn: vi.fn(),
        setIsAdmin: vi.fn(),
        isLoggedIn: false,
        signInStep: "",
        setSignInStep: vi.fn(),
        isAdmin: false,
      };

      return render(
        <MemoryRouter>
          <AuthContextProvider value={mockAuthValue}>
            {component}
          </AuthContextProvider>
        </MemoryRouter>
      );
    };

    vi.mocked(useSignInContext).mockReturnValue({
      signInStep: "",
      setSignInStep: vi.fn(),
    });

    renderWithAuthContext(<SignIn />);

    const usernameInput = screen.getByRole("textbox", { name: /^username$/i });
    const passwordInput = screen.getByLabelText(/^password$/i);

    // Fill in the form fields
    await user.type(usernameInput, "testuser");

    await user.type(passwordInput, "testpassword");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    vi.mocked(awsAmplifyAuth.signIn).mockResolvedValue({
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
  });

  test("displays error message with invalid input", () => {
    render(<SignIn />);

    // Fill in the form fields with invalid input
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    // Assert that the error message is displayed
    // Add your assertions here
  });
});
