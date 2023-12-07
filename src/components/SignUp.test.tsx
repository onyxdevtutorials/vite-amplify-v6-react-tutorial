import Auth, { SignUpInput, SignUpOutput } from "aws-amplify/auth";
import { vi, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import SignUp from "./SignUp";
import { SignUpContextProvider } from "../context/SignUpContext";

it("renders sign up form", () => {
  render(
    <SignUpContextProvider>
      <SignUp />
    </SignUpContextProvider>
  );
  const usernameInput = screen.getByRole("textbox", { name: /username/i });
  // input[type="password"] has no implicit aria role
  const passwordInput = screen.getByLabelText(/^password$/i);
  const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
  const emailInput = screen.getByRole("textbox", {
    name: /email/i,
  });
  const submitButton = screen.getByRole("button", { name: /sign up/i });

  expect(usernameInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(confirmPasswordInput).toBeInTheDocument();
  expect(emailInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});

it("submits the sign up form", async () => {
  const user = userEvent.setup();

  vi.spyOn(Auth, "signUp").mockImplementation(
    ({ username, password, options }: SignUpInput) => {
      return new Promise((resolve, reject) => {
        const response: SignUpOutput = {
          isSignUpComplete: true,
          nextStep: {
            codeDeliveryDetails: ,
            signUpStep: "CONFIRM_SIGN_UP",
          },
        };
        return resolve(response);
      });
    }
  );

  const mocks = vi.hoisted(() => {
    return {
      mockSignUp: vi.fn().mockResolvedValue({
        nextStep: {
          signUpStep: "CONFIRM_SIGN_UP",
        },
      }),
      mockUseSignUpContext: vi.fn().mockReturnValue({
        setUsername: vi.fn(),
        setSignUpStep: vi.fn(),
      }),
      mockSetUsername: vi.fn(),
      mockSetSignUpStep: vi.fn(),
    };
  });

  vi.mock("aws-amplify/auth", () => ({
    signUp: mocks.mockSignUp,
  }));

  render(
    <SignUpContextProvider>
      <SignUp />
    </SignUpContextProvider>
  );

  const usernameInput = screen.getByRole("textbox", { name: /username/i });
  const passwordInput = screen.getByLabelText(/^password$/i);
  const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
  const emailInput = screen.getByRole("textbox", { name: /email/i });
  const submitButton = screen.getByRole("button", { name: /sign up/i });

  await user.click(usernameInput);
  await user.keyboard("testuser");

  await user.click(passwordInput);
  await user.keyboard("testpassword");

  await user.click(confirmPasswordInput);
  await user.keyboard("testpassword");

  await user.click(emailInput);
  await user.keyboard("testuser@test.com");

  await user.click(submitButton);

  expect(mocks.mockSetUsername).toHaveBeenCalledWith("testuser");

  expect(mocks.mockSignUp).toHaveBeenCalledWith({
    username: "testuser",
    password: "testpassword",
    options: {
      userAttributes: {
        email: "testuser@test.com",
      },
      autoSignIn: true,
    },
  });

  expect(mocks.mockSetSignUpStep).toHaveBeenCalledWith("CONFIRM_SIGN_UP");
});
