import { describe, beforeEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignOut from "./SignOut";
import { AuthContextProvider } from "../context/AuthContext";
import userEvent from "@testing-library/user-event";

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

const { signOutMock } = vi.hoisted(() => {
  return { signOutMock: vi.fn().mockResolvedValue({}) };
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
      signOut: signOutMock,
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

describe("SignOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders a sign out button", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthContextProvider>
          <SignOut />
        </AuthContextProvider>
      </MemoryRouter>
    );

    const signOutButton = screen.getByRole("button", { name: "Sign Out" });
    expect(signOutButton).toBeInTheDocument();

    await user.click(signOutButton);

    expect(signOutMock).toHaveBeenCalledWith(mockNavigate);
  });
});
