import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUp from "./SignUp";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() };
});

const { signUpMock } = vi.hoisted(() => {
  return { signUpMock: vi.fn().mockResolvedValue({}) };
});

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
      signUp: signUpMock,
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

describe("SignUp page when user is not logged in", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mock("react-router-dom", async () => {
      const router = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
      );
      return {
        ...router,
        useNavigate: () => mockNavigate,
      };
    });

    vi.mocked(useAuthContextMock).mockReturnValue({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: signUpMock,
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignUp />
        </AuthContextProvider>
      </MemoryRouter>
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders sign up form when user is not logged in", async () => {
    const signUpForm = await screen.findByRole("form", {
      name: /Sign Up Form/i,
    });
    expect(signUpForm).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { level: 1, name: /Sign Up/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: /Email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign Up/i })
    ).toBeInTheDocument();
  });

  test("should call signUp fn from AuthContext with correct values", async () => {
    const user = userEvent.setup();

    const usernameInput = await screen.findByRole("textbox", {
      name: /^username$/i,
    });
    const emailInput = await screen.findByRole("textbox", { name: /Email/i });
    const passwordInput = await screen.findByLabelText(/^password$/i);
    const confirmPasswordInput = await screen.findByLabelText(
      /^confirm password$/i
    );
    const signUpButton = await screen.findByRole("button", {
      name: /Sign Up/i,
    });

    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "testuser@test.com");
    await user.type(passwordInput, "password");
    await user.type(confirmPasswordInput, "password");

    await user.click(signUpButton);

    expect(signUpMock).toHaveBeenCalledWith(
      {
        username: "testuser",
        email: "testuser@test.com",
        password: "password",
      },
      mockNavigate
    );
  });
});

describe("SignUp page when user is logged in", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mock("react-router-dom", async () => {
      const router = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
      );
      return {
        ...router,
        useNavigate: () => mockNavigate,
      };
    });

    vi.mocked(useAuthContextMock).mockReturnValue({
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: signUpMock,
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    });

    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignUp />
        </AuthContextProvider>
      </MemoryRouter>
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("does not render sign up form when user is logged in", async () => {
    const signUpForm = screen.queryByRole("form", { name: /Sign Up Form/i });
    expect(signUpForm).not.toBeInTheDocument();
    expect(screen.getByText(/You are logged in now/i)).toBeInTheDocument();
  });
});
