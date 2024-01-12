import { describe, beforeEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignOut from "./SignOut";
import { AuthContextProvider, useAuthContext } from "../context/AuthContext";
import { ReactNode } from "react";
import * as awsAmplifyAuth from "aws-amplify/auth";
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

describe("SignOut", () => {
  const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem");
  const errorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("should sign out and navigate to home page", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signOut).mockResolvedValueOnce(undefined);

    // Tests fail if we use mockReturnValueOnce instead of mockReturnValue
    vi.mocked(useAuthContext).mockReturnValue({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      isAdmin: false,
      setSignInStep: vi.fn(),
    });

    renderWithAuthContext(<SignOut />);

    const signOutButton = screen.getByRole("button", { name: /Sign Out/i });
    await user.click(signOutButton);

    expect(awsAmplifyAuth.signOut).toHaveBeenCalledTimes(1);
    expect(useAuthContext().setIsLoggedIn).toHaveBeenCalledWith(false);
    expect(useAuthContext().setIsAdmin).toHaveBeenCalledWith(false);
    expect(removeItemSpy).toHaveBeenNthCalledWith(1, "isLoggedIn");
    expect(removeItemSpy).toHaveBeenNthCalledWith(2, "isAdmin");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("should handle sign out error", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signOut).mockRejectedValueOnce(new Error());

    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      isAdmin: false,
      setSignInStep: vi.fn(),
    });

    renderWithAuthContext(<SignOut />);

    const signOutButton = screen.getByRole("button", { name: /Sign Out/i });
    await user.click(signOutButton);

    expect(awsAmplifyAuth.signOut).toHaveBeenCalledTimes(1);
    expect(useAuthContext().setIsLoggedIn).not.toHaveBeenCalled();
    expect(useAuthContext().setIsAdmin).not.toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });
});
