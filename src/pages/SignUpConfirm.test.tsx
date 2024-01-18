import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignUpConfirm from "./SignUpConfirm";
import userEvent from "@testing-library/user-event";
import { AuthContextProvider } from "../context/AuthContext";

const { useAuthContextMock } = vi.hoisted(() => {
  return {
    useAuthContextMock: vi.fn().mockReturnValue({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: true,
      user: null,
      checkUser: vi.fn(),
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

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() };
});

vi.mock("react-router-dom", async () => {
  const router = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...router,
    useParams: vi.fn().mockReturnValue({ username: "testuser" }),
    useNavigate: vi.fn().mockReturnValue(mockNavigate),
  };
});

describe("SignUpConfirm page", () => {
  describe("when user is not signed in", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(useAuthContextMock).mockReturnValue({
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
        confirmSignIn: vi.fn(),
        resetAuthState: vi.fn(),
      });

      await waitFor(() => {
        render(
          <MemoryRouter>
            <AuthContextProvider>
              <SignUpConfirm />
            </AuthContextProvider>
          </MemoryRouter>
        );
      });
    });

    test("renders sign up confirmation form", async () => {
      const usernameInput = screen.getByRole("textbox", {
        name: /^username$/i,
      });
      const confirmationCodeInput = screen.getByRole("textbox", {
        name: /^confirmation Code$/i,
      });
      const submitButton = screen.getByRole("button", { name: /^submit$/i });

      expect(usernameInput).toBeInTheDocument();
      expect(confirmationCodeInput).toBeInTheDocument();

      expect(usernameInput).toHaveValue("testuser");
      expect(submitButton).toBeInTheDocument();
    });

    test("calls confirmSignUp() with username, confirmation code and navigate fn", async () => {
      const user = userEvent.setup();

      const confirmationCodeInput = screen.getByRole("textbox", {
        name: /^confirmation Code$/i,
      });
      const submitButton = screen.getByRole("button", { name: /^submit$/i });

      await user.type(confirmationCodeInput, "123456");
      await user.click(submitButton);

      expect(useAuthContextMock().confirmSignUp).toHaveBeenCalledWith(
        { username: "testuser", confirmationCode: "123456" },
        mockNavigate
      );
    });

    test("displays error message when user does not enter confirmation code, and submit button is disabled", async () => {
      const user = userEvent.setup();

      const confirmationCodeInput = screen.getByRole("textbox", {
        name: /^confirmation Code$/i,
      });
      await user.type(confirmationCodeInput, "123456");
      await user.clear(confirmationCodeInput);

      const submitButton = screen.getByRole("button", { name: /^submit$/i });
      expect(submitButton).toBeDisabled();
      await user.click(submitButton);
      const confirmationCodeInputFeedback = confirmationCodeInput.nextSibling;
      expect(confirmationCodeInputFeedback).toHaveTextContent(/required/i);
    });
  });

  describe("when user is signed in", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(useAuthContextMock).mockReturnValue({
        isLoggedIn: true,
        signInStep: "",
        setSignInStep: vi.fn(),
        isAdmin: false,
        user: null,
        checkUser: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
        confirmSignUp: vi.fn(),
        confirmSignIn: vi.fn(),
        resetAuthState: vi.fn(),
      });

      await waitFor(() => {
        render(
          <MemoryRouter>
            <AuthContextProvider>
              <SignUpConfirm />
            </AuthContextProvider>
          </MemoryRouter>
        );
      });
    });

    test("displays warning message when user is already signed in", async () => {
      expect(
        await screen.findByText(
          "You are already signed in. You have no business confirming :-D"
        )
      ).toBeInTheDocument();
    });
  });
});
