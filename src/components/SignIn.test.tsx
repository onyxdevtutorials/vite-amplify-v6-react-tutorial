import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignIn from "./SignIn";
import { AuthContextProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";

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

const { signInMock } = vi.hoisted(() => {
  return { signInMock: vi.fn().mockResolvedValue({}) };
});

vi.mock("../context/AuthContext", async () => {
  const actual = await import("../context/AuthContext");
  return {
    ...actual,
    useAuthContext: vi.fn(() => ({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: signInMock,
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
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
    renderWithAuthContext(<SignIn />);
  });

  test("renders sign in form", () => {
    expect(
      screen.getByRole("textbox", { name: /^username$/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("should call signIn when user submits form with valid input", async () => {
    const user = userEvent.setup();

    const usernameInput = screen.getByRole("textbox", {
      name: /^username$/i,
    });
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(usernameInput, "testuser");

    await user.type(passwordInput, "testpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(signInMock).toHaveBeenCalledWith(
      {
        username: "testuser",
        password: "testpassword",
      },
      mockNavigate
    );
  });
});
