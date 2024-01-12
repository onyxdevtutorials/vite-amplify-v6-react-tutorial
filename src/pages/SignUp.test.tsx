import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUp from "./SignUp";
import * as awsAmplifyAuth from "aws-amplify/auth";
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

vi.mock("aws-amplify/auth");

describe("SignUp page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders sign up form when user is not logged in", () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValueOnce({});

    const { container } = render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    const signUpForm = container.querySelector("form.sign-up-form");
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

  test("does not render sign up form when user is logged in", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValueOnce({
      username: "mockUser",
      userId: "111",
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    // This works because I gave the form an accessible name via aria-label.
    // https://github.com/testing-library/dom-testing-library/issues/474
    expect(await screen.findByRole("form")).not.toBeInTheDocument();

    expect(
      await screen.findByText(/You are logged in now/i)
    ).toBeInTheDocument();
  });

  test("redirects to /signupconfirm/:username upon successful submission", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValueOnce({});

    // Mock the signUp function from aws-amplify/auth
    vi.mocked(awsAmplifyAuth.signUp).mockResolvedValueOnce({
      nextStep: {
        signUpStep: "CONFIRM_SIGN_UP",
        codeDeliveryDetails: {},
      },
      isSignUpComplete: true,
    });

    const { container } = render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    const signUpForm = container.querySelector("form.sign-up-form");
    expect(signUpForm).toBeInTheDocument();

    const usernameInput = screen.getByRole("textbox", { name: /^username$/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);
    const emailInput = screen.getByRole("textbox", { name: /^email$/i });
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpassword");
    await user.type(confirmPasswordInput, "testpassword");
    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    expect(awsAmplifyAuth.signUp).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
      options: {
        userAttributes: { email: "test@example.com" },
        autoSignIn: true,
      },
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/signupconfirm/testuser");
  });

  test("shows error feedback if user fails to fill out required fields", async () => {
    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    const usernameInput = screen.getByRole("textbox", { name: /^username$/i });
    const usernameInputFeedback = usernameInput.nextSibling;
    const passwordInput = screen.getByLabelText(/^password$/i);
    const passwordInputFeedback = passwordInput.nextSibling;
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);
    const confirmPasswordInputFeedback = confirmPasswordInput.nextSibling;
    const emailInput = screen.getByRole("textbox", { name: /^email$/i });
    const emailInputFeedback = emailInput.nextSibling;
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });

    await user.click(submitButton);

    expect(usernameInputFeedback).toHaveTextContent("Required");
    expect(passwordInputFeedback).toHaveTextContent("Required");
    expect(confirmPasswordInputFeedback).toHaveTextContent("Required");
    expect(emailInputFeedback).toHaveTextContent("Required");
  });
});
