import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";
import SignUpConfirm from "./SignUpConfirm";
import { useSignUpContext } from "../context/SignUpContext";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter

// Mock the context
vi.mock("../context/SignUpContext", () => ({
  useSignUpContext: vi.fn(() => ({
    signUpStep: null,
    setSignUpStep: vi.fn(),
    setUsername: vi.fn(),
  })),
}));

vi.mock("aws-amplify/auth");

describe("SignUpConfirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders confirmation form", () => {
    vi.mocked(useSignUpContext).mockReturnValue({
      username: "testuser",
      signUpStep: "CONFIRM_SIGN_UP",
      setSignUpStep: vi.fn(),
      setUsername: vi.fn(),
    });

    render(<SignUpConfirm />);

    // Assert that the confirmation form is rendered
    expect(screen.getByLabelText("Confirmation Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("displays error message when confirmation code is not provided", async () => {
    const user = userEvent.setup();

    vi.mocked(useSignUpContext).mockReturnValue({
      username: "testuser",
      signUpStep: "CONFIRM_SIGN_UP",
      setSignUpStep: vi.fn(),
      setUsername: vi.fn(),
    });

    render(<SignUpConfirm />);

    // Simulate form submission without entering confirmation code
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // Assert that the error message is displayed
    const confirmCodeInput = screen.getByRole("textbox", {
      name: /confirmation code/i,
    });
    const confirmCodeInputFeedback = confirmCodeInput.nextSibling;
    expect(confirmCodeInput).toHaveClass("is-invalid");
    expect(confirmCodeInputFeedback).toHaveTextContent("Required");
  });

  test("displays sign up complete message when signUpStep is 'DONE'", async () => {
    const user = userEvent.setup();

    // Mock the signUp function from aws-amplify/auth
    vi.mocked(awsAmplifyAuth.confirmSignUp).mockResolvedValue({
      nextStep: {
        signUpStep: "DONE",
      },
      isSignUpComplete: true,
    });

    render(
      <MemoryRouter>
        <SignUpConfirm />
      </MemoryRouter>
    );

    const confirmCodeInput = screen.getByRole("textbox", {
      name: /confirmation code/i,
    });
    await user.type(confirmCodeInput, "123456");
    const button = screen.getByRole("button", { name: /submit/i });

    await user.click(button);

    vi.mocked(useSignUpContext).mockReturnValue({
      username: "testuser",
      signUpStep: "DONE",
      setSignUpStep: vi.fn(),
      setUsername: vi.fn(),
    });

    expect(awsAmplifyAuth.confirmSignUp).toHaveBeenCalledWith({
      username: "testuser",
      confirmationCode: "123456",
    });

    // Assert that the sign up complete message is displayed
    expect(screen.getByText(/sign up complete/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });
});
