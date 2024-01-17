import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SignIn from "./SignIn";
import { AuthContextProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";

const { useAuthContextMock } = vi.hoisted(() => {
  return {
    useAuthContextMock: vi.fn().mockReturnValue({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    }),
  };
});

vi.mock("../context/AuthContext", async () => {
  const actual = await import("../context/AuthContext");
  return {
    ...actual,
    useAuthContext: useAuthContextMock,
  };
});

vi.mock("aws-amplify/auth");

const renderSignIn = () => {
  return render(
    <MemoryRouter>
      <AuthContextProvider>
        <SignIn />
      </AuthContextProvider>
    </MemoryRouter>
  );
};

describe("Sign In page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the sign in form if user is not already signed in", () => {
    const { container } = renderSignIn();
    const signInForm = container.querySelector("form.sign-in-form");
    expect(signInForm).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("does not show sign in form if user is already signed in", async () => {
    vi.mocked(useAuthContextMock).mockReturnValueOnce({
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    });

    const { container } = renderSignIn();

    const signInForm = container.querySelector("form.sign-in-form");
    expect(signInForm).not.toBeInTheDocument();

    expect(screen.getByText(/you are already signed in/i)).toBeInTheDocument();
  });
});
