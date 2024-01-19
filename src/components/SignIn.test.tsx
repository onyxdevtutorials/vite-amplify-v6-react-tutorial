import { vi, describe, test, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignIn from "./SignIn";
import { AuthContextProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import { ReactNode } from "react";
import { toast } from "react-toastify";

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
      checkUser: vi.fn(),
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

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithAuthContext = async (component: ReactNode) => {
  await waitFor(() => {
    render(
      <MemoryRouter>
        <AuthContextProvider>{component}</AuthContextProvider>
      </MemoryRouter>
    );
  });
};

describe("SignIn component", () => {
  describe("when user is not logged in (happy path)", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      await renderWithAuthContext(<SignIn />);
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

      expect(signInMock).toHaveBeenCalledTimes(1);
      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        expect.stringMatching(/^successfully signed in/i)
      );
    });
  });
  describe("error handling", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(signInMock).mockRejectedValue({});

      await renderWithAuthContext(<SignIn />);
    });
    test("should call toast.error when signIn throws an error", async () => {
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
      expect(signInMock).toHaveBeenCalledTimes(1);
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
        expect.stringMatching(/^error signing in/i)
      );
    });
  });
});
