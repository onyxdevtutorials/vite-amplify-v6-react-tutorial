import { describe, test, vi, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ListProducts from "./ListProducts";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";
import { ReactNode } from "react";
import {
  ProductWithReviews,
  ListProductsQueryWithReviews,
  Review,
} from "../types";

const renderWithAuthContext = async (component: ReactNode) => {
  await waitFor(() => {
    render(
      <MemoryRouter>
        <AuthContextProvider>{component}</AuthContextProvider>
      </MemoryRouter>
    );
  });
};

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

vi.mock("aws-amplify/api", () => {
  return {
    generateClient: () => ({
      graphql: vi.fn().mockResolvedValue({
        data: {
          listProducts: {
            items: [
              {
                id: "1",
                name: "Product 1",
                description: "Description 1",
                price: "10",
                isArchived: false,
                reviews: {
                  items: Array(5).fill({
                    id: "1",
                    content: "Review 1",
                  } as Review),
                },
              },
              {
                id: "2",
                name: "Product 2",
                description: "Description 2",
                price: "20",
                isArchived: false,
                reviews: {
                  items: Array(3).fill({
                    id: "2",
                    content: "Review 2",
                  } as Review),
                },
              },
            ] as ProductWithReviews[],
            nextToken: "",
          },
        } as ListProductsQueryWithReviews,
      }),
    }),
  };
});

vi.mock("aws-amplify/auth");

describe("ListProducts", () => {
  describe("when the user is signed in", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(useAuthContextMock).mockReturnValueOnce({
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

      await renderWithAuthContext(<ListProducts />);
    });

    test("renders products for a signed-in user", async () => {
      const headings = await screen.findAllByRole("generic", {
        name: (_, element) => element?.classList.contains("product-name"),
      });

      expect(headings).toHaveLength(2);

      const productName = await screen.findByText("Product 1");
      const productDescription = await screen.findByText("Description 1");
      const productPrice = await screen.findByText("10");
      const reviewCount = await screen.findByText(/5 reviews/i);

      expect(productName).toBeInTheDocument();
      expect(productDescription).toBeInTheDocument();
      expect(productPrice).toBeInTheDocument();
      expect(reviewCount).toBeInTheDocument();
    });
  });

  describe("when the user is signed out", () => {
    beforeEach(async () => {
      vi.clearAllMocks();

      vi.mocked(useAuthContextMock).mockReturnValueOnce({
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

      await renderWithAuthContext(<ListProducts />);
    });

    test("renders products for a signed-out user", async () => {
      const headings = await screen.findAllByRole("generic", {
        name: (_, element) => element?.classList.contains("product-name"),
      });

      expect(headings).toHaveLength(2);

      const productName = await screen.findByText("Product 1");
      const productDescription = await screen.findByText("Description 1");
      const productPrice = await screen.findByText("10");
      const reviewCount = await screen.findByText(/5 reviews/i);

      expect(productName).toBeInTheDocument();
      expect(productDescription).toBeInTheDocument();
      expect(productPrice).toBeInTheDocument();
      expect(reviewCount).toBeInTheDocument();
    });
  });
});
