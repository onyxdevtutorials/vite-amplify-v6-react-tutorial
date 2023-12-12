import { vi, expect, it, describe, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";
import SignUp from "./SignUp";
import { useSignUpContext } from "../context/SignUpContext";

// Mock the context
vi.mock("../context/SignUpContext", () => ({
  useSignUpContext: vi.fn(() => ({
    signUpStep: null,
    setSignUpStep: vi.fn(),
    setUsername: vi.fn(),
  })),
}));

vi.mock("aws-amplify/auth");

describe("SignUp component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form correctly", () => {
    render(<SignUp />);

    const usernameInput = screen.getByRole("textbox", { name: /username/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const emailInput = screen.getByRole("textbox", { name: /email/i });

    // Check if form elements are rendered
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("submits the form correctly", async () => {
    render(<SignUp />);

    const usernameInput = screen.getByRole("textbox", { name: /username/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const emailInput = screen.getByRole("textbox", { name: /email/i });

    const user = userEvent.setup();

    vi.mocked(useSignUpContext).mockReturnValue({
      username: "",
      signUpStep: "",
      setSignUpStep: vi.fn(),
      setUsername: vi.fn(),
    });

    // Mock the signUp function from aws-amplify/auth
    vi.mocked(awsAmplifyAuth.signUp).mockResolvedValue({
      nextStep: {
        signUpStep: "CONFIRM_SIGN_UP",
        codeDeliveryDetails: {},
      },
      isSignUpComplete: true,
    });

    // Fill out the form
    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpassword");
    await user.type(confirmPasswordInput, "testpassword");
    await user.type(emailInput, "test@example.com");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Check if the signUp function is called with the correct parameters
    // await screen.findByText(/There was a problem signing you up/i);
    expect(awsAmplifyAuth.signUp).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpassword",
      options: {
        userAttributes: { email: "test@example.com" },
        autoSignIn: true,
      },
    });

    expect(useSignUpContext().setSignUpStep).toHaveBeenCalledWith(
      "CONFIRM_SIGN_UP"
    );

    expect(useSignUpContext().setUsername).toHaveBeenCalledWith("testuser");
  });
});
