import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInConfirm from "./SignInConfirm";
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

const { confirmSignInMock } = vi.hoisted(() => {
  return { confirmSignInMock: vi.fn().mockResolvedValue({}) };
});

const { useAuthContextMock } = vi.hoisted(() => {
  return {
    useAuthContextMock: vi.fn().mockReturnValue({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      checkUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: confirmSignInMock,
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

const renderWithAuthContext = async (component: ReactNode) => {
  await waitFor(() => {
    render(
      <MemoryRouter>
        <AuthContextProvider>{component}</AuthContextProvider>
      </MemoryRouter>
    );
  });
};

describe("SignInConfirm", () => {
  describe("Success path", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(confirmSignInMock).mockResolvedValue(undefined);

      await renderWithAuthContext(<SignInConfirm />);
    });

    test("renders the sign in confirm form", () => {
      expect(
        screen.getByRole("heading", { name: /please set a new password/i })
      ).toBeInTheDocument();

      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    test("user fills out and successfully submits the confirm sign in form", async () => {
      const user = userEvent.setup();

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", {
        name: /change password/i,
      });

      await user.type(passwordInput, "newpassword");
      await user.click(submitButton);

      expect(confirmSignInMock).toHaveBeenCalledTimes(1);
      expect(confirmSignInMock).toHaveBeenCalledWith(
        {
          challengeResponse: "newpassword",
        },
        mockNavigate
      );
    });
  });

  describe("Failure path", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(confirmSignInMock).mockRejectedValue({
        message: "error",
      });

      await renderWithAuthContext(<SignInConfirm />);
    });
    test("user fills out and unsuccessfully submits the confirm sign in form", async () => {
      const user = userEvent.setup();

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", {
        name: /change password/i,
      });

      await user.type(passwordInput, "newpassword");
      await user.click(submitButton);

      expect(confirmSignInMock).toHaveBeenCalledTimes(1);
      expect(confirmSignInMock).toHaveBeenCalledWith(
        {
          challengeResponse: "newpassword",
        },
        mockNavigate
      );
    });
  });
});
