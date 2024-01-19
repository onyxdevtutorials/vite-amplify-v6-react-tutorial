import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, render, waitFor } from "@testing-library/react";
import HomeLayout from "./HomeLayout";
import { AuthContextProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";

const { useAuthContextMock } = vi.hoisted(() => {
  return {
    useAuthContextMock: vi.fn().mockReturnValue({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      checkUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    }),
  };
});

vi.mock("../context/AuthContext", async () => {
  const actual = await import("../context/AuthContext");
  return {
    ...actual,
    useAuthContext: useAuthContextMock,
  };
});

vi.mock("aws-amplify/auth");

const renderComponent = async () => {
  await waitFor(() => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <HomeLayout />
        </AuthContextProvider>
      </MemoryRouter>
    );
  });
};

describe("HomeLayout", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await renderComponent();
  });
  test("renders the Banner component", () => {
    const bannerElement = screen.getByRole("navigation");
    expect(bannerElement).toBeInTheDocument();
  });

  test("renders the main element", () => {
    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();
  });
});
