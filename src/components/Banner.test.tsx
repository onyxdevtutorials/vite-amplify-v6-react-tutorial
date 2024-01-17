import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthContextProvider } from "../context/AuthContext";
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

const { useAuthContextMock } = vi.hoisted(() => {
  return {
    useAuthContextMock: vi.fn().mockReturnValue({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
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
    vi.mocked(useAuthContextMock).mockReturnValueOnce({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
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
    const signOutButton = screen.queryByRole("button", { name: /sign out/i });

    expect(signInButton).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();
    expect(signOutButton).not.toBeInTheDocument();
  });

  test("renders Add Product link when logged in as admin", () => {
    vi.mocked(useAuthContextMock).mockReturnValueOnce({
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: true,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    });

    renderWithAuthContext(<Banner />);

    const addProductLink = screen.getByRole("link", { name: /add product/i });
    expect(addProductLink).toBeInTheDocument();
  });

  test("renders Sign Out button when logged in but not Sign In or Sign Up buttons", () => {
    vi.mocked(useAuthContextMock).mockReturnValueOnce({
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
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

    vi.mocked(useAuthContextMock).mockReturnValueOnce({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    });

    renderWithAuthContext(<Banner />);

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  test("navigates to /signup when Sign Up button is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthContextMock).mockReturnValueOnce({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    });

    renderWithAuthContext(<Banner />);

    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(signUpButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });
});
