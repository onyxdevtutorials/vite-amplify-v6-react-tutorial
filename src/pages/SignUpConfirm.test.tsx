import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignUpConfirm from "./SignUpConfirm";
import * as awsAmplifyAuth from "aws-amplify/auth";
import userEvent from "@testing-library/user-event";

vi.mock("aws-amplify/auth");

vi.mock("react-router-dom", async () => {
  const router = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...router,
    useParams: vi.fn().mockReturnValue({ username: "testuser" }),
  };
});

describe("SignUpConfirm page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders sign up confirmation form", () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValue({});

    render(<SignUpConfirm />);

    const usernameInput = screen.getByRole("textbox", { name: /^username$/i });
    const confirmationCodeInput = screen.getByRole("textbox", {
      name: /^confirmation Code$/i,
    });
    const submitButton = screen.getByRole("button", { name: /^submit$/i });

    expect(usernameInput).toBeInTheDocument();
    expect(confirmationCodeInput).toBeInTheDocument();

    expect(usernameInput).toHaveValue("testuser");
    expect(submitButton).toBeInTheDocument();
  });

  test("displays warning message when user is already signed in", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValue({
      username: "testuser",
      userId: "111",
    });

    render(<SignUpConfirm />);

    expect(
      await screen.findByText(
        "You are already signed in. You have no business confirming :-D"
      )
    ).toBeInTheDocument();
  });

  test("displays success message after successful sign up confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValue({});
    vi.mocked(awsAmplifyAuth.confirmSignUp).mockResolvedValue({
      isSignUpComplete: true,
      nextStep: {
        signUpStep: "DONE",
      },
    });
    render(
      <MemoryRouter>
        <SignUpConfirm />
      </MemoryRouter>
    );
    const confirmationCodeInput = screen.getByRole("textbox", {
      name: /^confirmation Code$/i,
    });
    const submitButton = screen.getByRole("button", { name: /^submit$/i });

    await user.type(confirmationCodeInput, "123456");
    await user.click(submitButton);

    expect(await screen.findByText(/Sign up complete/i)).toBeInTheDocument();
  });

  test("displays error message when user does not enter confirmation code", async () => {
    const user = userEvent.setup();
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValue({});
    render(
      <MemoryRouter>
        <SignUpConfirm />
      </MemoryRouter>
    );
    const submitButton = screen.getByRole("button", { name: /^submit$/i });
    await user.click(submitButton);
    const confirmationCodeInput = screen.getByRole("textbox", {
      name: /^confirmation Code$/i,
    });
    const confirmationCodeInputFeedback = confirmationCodeInput.nextSibling;
    expect(confirmationCodeInputFeedback).toHaveTextContent(/required/i);
  });

  test.only("displays error message when user enters invalid confirmation code", async () => {
    const user = userEvent.setup();
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValue({});
    vi.mocked(awsAmplifyAuth.confirmSignUp).mockRejectedValue({});
    render(
      <MemoryRouter>
        <SignUpConfirm />
      </MemoryRouter>
    );
    const confirmationCodeInput = screen.getByRole("textbox", {
      name: /^confirmation Code$/i,
    });
    const submitButton = screen.getByRole("button", { name: /^submit$/i });
    await user.type(confirmationCodeInput, "123456");
    await user.click(submitButton);
    const alertMessage = await screen.findByRole("alert");
    expect(alertMessage).toHaveTextContent(/There was a problem confirming/i);
  });
});
