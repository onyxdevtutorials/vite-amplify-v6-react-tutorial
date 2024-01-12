import { describe, test, vi, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ListProducts from "./ListProducts";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";
import { ReactNode } from "react";
import * as awsAmplifyAuth from "aws-amplify/auth";
import {
  ProductWithReviews,
  ListProductsQueryWithReviews,
  Review,
} from "../types";

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders products for a signed-in user", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValueOnce({
      username: "mockUser",
      userId: "111",
    });

    renderWithAuthContext(<ListProducts />);

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

  test("renders products for a signed-out user", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValueOnce({});

    renderWithAuthContext(<ListProducts />);

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
