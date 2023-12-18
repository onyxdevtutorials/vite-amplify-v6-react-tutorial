import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    vi.mocked(useAuthContext).mockReturnValue({
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
    vi.mocked(useAuthContext).mockReturnValue({
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
    vi.mocked(useAuthContext).mockReturnValue({
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

  test.only("navigates to /signin when Sign In button is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthContext).mockReturnValue({
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

  test("calls handleSignIn when Sign In button is clicked", () => {
    const handleSignIn = jest.fn();

    render(
      <AuthContextProvider>
        <Router>
          <Banner handleSignIn={handleSignIn} />
        </Router>
      </AuthContextProvider>
    );

    const signInButton = screen.getByText("Sign In");
    fireEvent.click(signInButton);

    expect(handleSignIn).toHaveBeenCalledTimes(1);
  });

  test("calls handleSignUp when Sign Up button is clicked", () => {
    const handleSignUp = jest.fn();

    render(
      <AuthContextProvider>
        <Router>
          <Banner handleSignUp={handleSignUp} />
        </Router>
      </AuthContextProvider>
    );

    const signUpButton = screen.getByText("Sign Up");
    fireEvent.click(signUpButton);

    expect(handleSignUp).toHaveBeenCalledTimes(1);
  });

  test("calls handleSignOut when Sign Out button is clicked", () => {
    const handleSignOut = jest.fn();

    render(
      <AuthContextProvider value={{ isLoggedIn: true }}>
        <Router>
          <Banner handleSignOut={handleSignOut} />
        </Router>
      </AuthContextProvider>
    );

    const signOutButton = screen.getByText("Sign Out");
    fireEvent.click(signOutButton);

    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });
});
