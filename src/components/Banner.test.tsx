import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as awsAmplifyAuth from "aws-amplify/auth";
import { AuthContextProvider, useAuthContext } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import Banner from "./Banner";
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

vi.mock("../context/AuthContext", async () => {
  const actual = await import("../context/AuthContext");
  return {
    ...actual,
    useAuthContext: vi.fn(() => ({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
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

describe("Banner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders site name", () => {
    renderWithAuthContext(<Banner />);

    const navElement = screen.getByRole("navigation");
    const withinNavElement = within(navElement);

    const siteNameElement = withinNavElement.getByText("Site Name");
    expect(siteNameElement).toBeInTheDocument();
  });

  test("renders Sign In and Sign Up buttons when not logged in", () => {
    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<Banner />);

    const navElement = screen.getByRole("navigation");
    const withinNavElement = within(navElement);

    const signInButton = withinNavElement.getByRole("button", {
      name: /^sign in$/i,
    });
    const signUpButton = withinNavElement.getByRole("button", {
      name: /^sign up$/i,
    });

    expect(signInButton).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();
  });

  test("renders Add Product link when logged in as admin", () => {
    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: true,
    });

    renderWithAuthContext(<Banner />);

    const addProductLink = screen.getByRole("link", { name: /add product/i });
    expect(addProductLink).toBeInTheDocument();
  });

  test("renders Sign Out button when logged in but not Sign In or Sign Up buttons", () => {
    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<Banner />);

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();

    const signInButton = screen.queryByRole("button", { name: /sign in/i });
    const signUpButton = screen.queryByRole("button", { name: /sign up/i });

    expect(signInButton).not.toBeInTheDocument();
    expect(signUpButton).not.toBeInTheDocument();
  });

  test("navigates to /signin when Sign In button is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<Banner />);

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  test("navigates to /signup when Sign Up button is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<Banner />);

    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(signUpButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  test("calls signOut when Sign Out button is clicked", async () => {
    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    const user = userEvent.setup();

    vi.mocked(awsAmplifyAuth.signOut);

    renderWithAuthContext(<Banner />);

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    await user.click(signOutButton);

    expect(awsAmplifyAuth.signOut).toHaveBeenCalledTimes(1);
  });
});
