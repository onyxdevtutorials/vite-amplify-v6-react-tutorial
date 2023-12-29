import React from "react";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignInContextProvider, useSignInContext } from "./SignInContext";
import userEvent from "@testing-library/user-event";

describe("SignInContext", () => {
  test("should set and get signInStep correctly", async () => {
    const user = userEvent.setup();

    const TestComponent: React.FC = () => {
      const { signInStep, setSignInStep } = useSignInContext();

      return (
        <div>
          <span data-testid="signInStep">{signInStep}</span>
          <button onClick={() => setSignInStep("step1")}>Set Step 1</button>
          <button onClick={() => setSignInStep("step2")}>Set Step 2</button>
        </div>
      );
    };

    render(
      <SignInContextProvider>
        <TestComponent />
      </SignInContextProvider>
    );

    const signInStepElement = screen.getByTestId("signInStep");

    expect(signInStepElement.textContent).toBe("");

    const setStep1Button = screen.getByRole("button", { name: /Set Step 1/i });

    await user.click(setStep1Button);

    expect(signInStepElement.textContent).toBe("step1");

    const setStep2Button = screen.getByRole("button", { name: /Set Step 2/i });

    await user.click(setStep2Button);

    expect(signInStepElement.textContent).toBe("step2");
  });
});
