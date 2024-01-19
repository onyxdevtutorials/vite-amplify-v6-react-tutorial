import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Landing from "./Landing";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider, useAuthContext } from "../context/AuthContext";
import { ReactNode } from "react";

const renderWithAuthContext = async (component: ReactNode) => {
  await waitFor(() => {
    render(
      <MemoryRouter>
        <AuthContextProvider>{component}</AuthContextProvider>
      </MemoryRouter>
    );
  });
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

describe("Landing", () => {
  describe("when user is logged in", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(useAuthContext).mockReturnValueOnce({
        isLoggedIn: true,
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
      });

      await renderWithAuthContext(<Landing />);
    });

    test("renders 'Is logged in: yes' when user is logged in", async () => {
      const isLoggedInText = await screen.findByText(/Is logged in: yes/i);
      expect(isLoggedInText).toBeInTheDocument();
    });
    test("renders the ListProducts component when user is logged in", async () => {
      expect(
        await screen.findByRole("heading", { level: 1, name: /list products/i })
      ).toBeInTheDocument();
      const listProductsElement = screen.getByRole("list");
      expect(listProductsElement).toBeInTheDocument();
    });
  });

  describe("when user is not logged in", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(useAuthContext).mockReturnValueOnce({
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
      });

      await renderWithAuthContext(<Landing />);
    });
    test("renders 'Is logged in: no' when user is not logged in", () => {
      const isLoggedInText = screen.getByText(/Is logged in: no/i);
      expect(isLoggedInText).toBeInTheDocument();
    });
    test("renders the ListProducts component when user is not logged in", async () => {
      expect(
        await screen.findByRole("heading", { level: 1, name: /list products/i })
      ).toBeInTheDocument();
      const listProductsElement = screen.getByRole("list");
      expect(listProductsElement).toBeInTheDocument();
    });
  });
});
