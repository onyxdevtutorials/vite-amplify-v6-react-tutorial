import { render, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("aws-amplify/auth");

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
      isAdmin: false,
      setIntendedPath: vi.fn(),
    }),
  };
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("redirects to /signin when not logged in", async () => {
    useAuthContextMock.mockReturnValue({
      isLoggedIn: false,
      isAdmin: false,
      setIntendedPath: vi.fn(),
    });

    await waitFor(() => {
      render(
        <MemoryRouter>
          <AuthContextProvider>
            <ProtectedRoute />
          </AuthContextProvider>
        </MemoryRouter>
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  test("redirects to /not-authorized when not logged in as admin", async () => {
    useAuthContextMock.mockReturnValue({
      isLoggedIn: true,
      isAdmin: false,
      setIntendedPath: vi.fn(),
    });

    await waitFor(() => {
      render(
        <MemoryRouter>
          <AuthContextProvider>
            <ProtectedRoute role="admin" />
          </AuthContextProvider>
        </MemoryRouter>
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/not-authorized");
  });

  test("renders children when user is logged in and has correct role", async () => {
    useAuthContextMock.mockReturnValue({
      isLoggedIn: true,
      isAdmin: true,
      setIntendedPath: vi.fn(),
    });

    await waitFor(() => {
      render(
        <MemoryRouter>
          <AuthContextProvider>
            <ProtectedRoute role="admin">
              <div>Protected content</div>
            </ProtectedRoute>
          </AuthContextProvider>
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
