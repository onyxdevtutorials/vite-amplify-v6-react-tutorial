import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// import * as awsAmplifyAuth from "aws-amplify/auth";
import SignInConfirm from "./SignInConfirm";
import { AuthContextProvider, useAuthContext } from "../context/AuthContext";
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
  return { confirmSignInMock: vi.fn() };
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
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: confirmSignInMock,
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

describe("SignInConfirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    renderWithAuthContext(<SignInConfirm />);
  });

  test("renders the sign in confirm form", () => {
    expect(
      screen.getByRole("heading", { name: /please set a new password/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  test.only("user (not an admin) fills out and successfully submits the confirm sign in form", async () => {
    const user = userEvent.setup();

    // const confirmSignInMock = vi.fn();
    // vi.mocked(useAuthContext).mockReturnValueOnce({
    //   isLoggedIn: false,
    //   signInStep: "",
    //   setSignInStep: vi.fn(),
    //   isAdmin: false,
    //   user: null,
    //   signIn: vi.fn(),
    //   signOut: vi.fn(),
    //   signUp: vi.fn(),
    //   confirmSignUp: vi.fn(),
    //   confirmSignIn: confirmSignInMock,
    //   resetAuthState: vi.fn(),
    // });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole("button", {
      name: /change password/i,
    });

    await user.type(passwordInput, "newpassword");

    await user.click(submitButton);
    console.log("+++++++", confirmSignInMock.mock.calls);

    expect(confirmSignInMock).toHaveBeenCalled();

    // expect(confirmSignInMock).toHaveBeenCalledWith(
    //   {
    //     challengeResponse: "newpassword",
    //   },
    //   mockNavigate
    // );
  });

  test.todo(
    "submits the form without filling in a new password",
    async () => {}
  );

  test.todo(
    "user (an admin) fills out and successfully submits the confirm sign in form",
    async () => {}
  );
});
