import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";
import { toast } from "react-toastify";
import { AuthContextProvider } from "../context/AuthContext";

vi.mock("aws-amplify/auth");

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
  },
}));

const renderChangePassword = async () => {
  await waitFor(async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <ChangePassword />
        </AuthContextProvider>
      </MemoryRouter>
    );
  });
};

describe("ChangePassword", () => {
  describe("success path", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValue({
        username: "testuser",
        userId: "123",
      });

      vi.mocked(awsAmplifyAuth.updatePassword).mockResolvedValue();

      await renderChangePassword();
    });

    test("renders Change Password form", () => {
      expect(
        screen.getByRole("heading", { level: 1, name: /change password/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /username/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Old Password")).toBeInTheDocument();
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Change Password" })
      ).toBeInTheDocument();
    });

    test("updates password successfully", async () => {
      const user = userEvent.setup();

      const oldPasswordInput = screen.getByLabelText("Old Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const changePasswordButton = screen.getByRole("button", {
        name: /change password/i,
      });

      await user.type(oldPasswordInput, "oldpassword");
      await user.type(newPasswordInput, "newpassword");

      await user.click(changePasswordButton);

      expect(awsAmplifyAuth.updatePassword).toHaveBeenCalledTimes(1);
      expect(awsAmplifyAuth.updatePassword).toHaveBeenCalledWith({
        oldPassword: "oldpassword",
        newPassword: "newpassword",
      });

      expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
        "Password changed successfully"
      );
    });
  });
  describe("error handling", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      const errorMessage = "Incorrect username or password.";

      vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValueOnce({
        username: "testuser",
        userId: "123",
      });

      vi.mocked(awsAmplifyAuth.updatePassword).mockRejectedValueOnce({
        message: errorMessage,
      });

      await renderChangePassword();
    });
    test("displays error message when password update fails because user entered incorrect old password", async () => {
      const user = userEvent.setup();

      const oldPasswordInput = screen.getByLabelText("Old Password");
      const newPasswordInput = screen.getByLabelText("New Password");
      const changePasswordButton = screen.getByRole("button", {
        name: "Change Password",
      });

      await user.type(oldPasswordInput, "oldpassword");
      await user.type(newPasswordInput, "newpassword");

      await user.click(changePasswordButton);

      expect(
        await screen.findByText(/Problem updating password/i)
      ).toBeInTheDocument();
    });

    test("displays feedback if user tries to submit form without entering old and new passwords", async () => {
      const user = userEvent.setup();

      const oldPasswordInput = screen.getByLabelText(/old password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const oldPasswordInputFeedback = oldPasswordInput.nextElementSibling;
      const newPasswordInputFeedback = newPasswordInput.nextElementSibling;

      const changePasswordButton = screen.getByRole("button", {
        name: /change password/i,
      });

      await user.click(changePasswordButton);

      expect(oldPasswordInput).toHaveClass("is-invalid");
      expect(newPasswordInput).toHaveClass("is-invalid");
      expect(oldPasswordInputFeedback).toHaveTextContent(/required/i);
      expect(newPasswordInputFeedback).toHaveTextContent(/required/i);
    });
  });
});
