import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Landing from "./Landing";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider, useAuthContext } from "../context/AuthContext";
import { ReactNode } from "react";
import * as awsAmplifyAuth from "aws-amplify/auth";

const renderWithAuthContext = (component: ReactNode) => {
  return render(
    <MemoryRouter>
      <AuthContextProvider>{component}</AuthContextProvider>
    </MemoryRouter>
  );
};

vi.mock("aws-amplify/api", () => {
  return {
    generateClient: () => ({
      graphql: vi.fn().mockResolvedValue({
        data: {
          listProducts: {
            items: [
              {
                id: 1,
                name: "Product 1",
                description: "Description 1",
                price: 10,
              },
              {
                id: 2,
                name: "Product 2",
                description: "Description 2",
                price: 20,
              },
            ],
          },
        },
      }),
    }),
  };
});

vi.mock("aws-amplify/auth");

vi.mock("../context/AuthContext", async () => {
  const actual = await import("../context/AuthContext");
  return {
    ...actual,
    useAuthContext: vi.fn(() => ({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    })),
  };
});

describe("Landing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders 'Is logged in: yes' when user is logged in", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValueOnce({
      username: "mockUser",
      userId: "111",
    });

    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<Landing />);

    const isLoggedInText = await screen.findByText(/Is logged in: yes/i);
    expect(isLoggedInText).toBeInTheDocument();
  });

  test("renders 'Is logged in: no' when user is not logged in", () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValueOnce({});

    vi.mocked(useAuthContext).mockReturnValue({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<Landing />);

    const isLoggedInText = screen.getByText(/Is logged in: no/i);
    expect(isLoggedInText).toBeInTheDocument();
  });

  test("renders the ListProducts component when user is logged in", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValueOnce({
      username: "mockUser",
      userId: "111",
    });

    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<Landing />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /list products/i })
    ).toBeInTheDocument();
    const listProductsElement = screen.getByRole("list");
    expect(listProductsElement).toBeInTheDocument();
  });

  test("renders the ListProducts component when user is not logged in", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValueOnce({});

    vi.mocked(useAuthContext).mockReturnValueOnce({
      setIsLoggedIn: vi.fn(),
      setIsAdmin: vi.fn(),
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
    });

    renderWithAuthContext(<Landing />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /list products/i })
    ).toBeInTheDocument();
    const listProductsElement = screen.getByRole("list");
    expect(listProductsElement).toBeInTheDocument();
  });
});
