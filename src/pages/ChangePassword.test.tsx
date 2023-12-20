import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";

vi.mock("aws-amplify/auth");

describe("ChangePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Change Password form", () => {
    render(
      <MemoryRouter>
        <ChangePassword />
      </MemoryRouter>
    );

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

    vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValue({
      username: "testuser",
      userId: "123",
    });

    vi.mocked(awsAmplifyAuth.updatePassword).mockResolvedValue();

    render(
      <MemoryRouter>
        <ChangePassword />
      </MemoryRouter>
    );

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

    expect(
      screen.getByText("Password changed successfully")
    ).toBeInTheDocument();
  });

  test.only("displays error message when password update fails because user entered incorrect old password", async () => {
    const user = userEvent.setup();
    const errorMessage = "Incorrect username or password.";

    vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValue({
      username: "testuser",
      userId: "123",
    });

    vi.mocked(awsAmplifyAuth.updatePassword).mockRejectedValue({
      message: errorMessage,
    });

    render(
      <MemoryRouter>
        <ChangePassword />
      </MemoryRouter>
    );

    const oldPasswordInput = screen.getByLabelText("Old Password");
    const newPasswordInput = screen.getByLabelText("New Password");
    const changePasswordButton = screen.getByRole("button", {
      name: "Change Password",
    });

    await user.type(oldPasswordInput, "oldpassword");
    await user.type(newPasswordInput, "newpassword");

    await user.click(changePasswordButton);

    expect(
      await screen.findByText(`Problem updating password: ${errorMessage}`)
    ).toBeInTheDocument();
  });
});
