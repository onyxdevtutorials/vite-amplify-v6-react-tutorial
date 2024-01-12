import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SignIn from "./SignIn";
import { useAuthContext } from "../context/AuthContext";
import { useSignInContext } from "../context/SignInContext";
import { MemoryRouter } from "react-router-dom";

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

vi.mock("../context/AuthContext", async () => {
  const actual = await import("../context/AuthContext");
  return {
    ...actual,
    useAuthContext: vi.fn(() => ({
      isAdmin: false,
      isLoggedIn: false,
    })),
  };
});

vi.mock("../context/SignInContext", async () => {
  const actual = await import("../context/SignInContext");
  return {
    ...actual,
    useSignInContext: vi.fn(() => ({
      signInStep: "",
      setSignInStep: vi.fn(),
    })),
  };
});

const renderSignIn = () => {
  return render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>
  );
};

describe("Sign In page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the sign in form if user is not already signed in", () => {
    // Test fails with mockReturnValueOnce
    vi.mocked(useAuthContext).mockReturnValue({
      isAdmin: false,
      isLoggedIn: false,
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      signInStep: "",
      setSignInStep: vi.fn(),
    });

    vi.mocked(useSignInContext).mockReturnValueOnce({
      signInStep: "",
      setSignInStep: vi.fn(),
    });

    const { container } = renderSignIn();
    const signInForm = container.querySelector("form.sign-in-form");
    expect(signInForm).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("does not show sign in form if user is already signed in", async () => {
    vi.mocked(useAuthContext).mockReturnValueOnce({
      isAdmin: false,
      isLoggedIn: true,
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      signInStep: "",
      setSignInStep: vi.fn(),
    });

    vi.mocked(useSignInContext).mockReturnValueOnce({
      signInStep: "DONE",
      setSignInStep: vi.fn(),
    });

    const { container } = renderSignIn();

    const signInForm = container.querySelector("form.sign-in-form");
    expect(signInForm).not.toBeInTheDocument();

    expect(screen.getByText(/you are already signed in/i)).toBeInTheDocument();
  });

  test("renders the sign in confirmation if a new password is required", () => {
    vi.mocked(useAuthContext).mockReturnValueOnce({
      isAdmin: false,
      isLoggedIn: false,
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
      setSignInStep: vi.fn(),
    });

    vi.mocked(useSignInContext).mockReturnValueOnce({
      signInStep: "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED",
      setSignInStep: vi.fn(),
    });

    const { container } = renderSignIn();

    const signInConfirm = container.querySelector("form.sign-in-confirm-form");
    expect(signInConfirm).toBeInTheDocument();
  });
});
