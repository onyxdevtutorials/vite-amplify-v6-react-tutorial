import { describe, test, vi, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ListProducts from "./ListProducts";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";
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

describe("ListProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders products for a signed-in user", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockResolvedValue({
      username: "mockUser",
      userId: "111",
    });

    renderWithAuthContext(<ListProducts />);

    const headings = await screen.findAllByRole("generic", {
      name: (content, element) => element?.classList.contains("product-name"),
    });

    expect(headings).toHaveLength(2);

    const productName = await screen.findByText("Product 1");
    const productDescription = await screen.findByText("Description 1");
    const productPrice = await screen.findByText("10");

    expect(productName).toBeInTheDocument();
    expect(productDescription).toBeInTheDocument();
    expect(productPrice).toBeInTheDocument();
  });

  test("renders products for a signed-out user", async () => {
    vi.mocked(awsAmplifyAuth.getCurrentUser).mockRejectedValue({});

    renderWithAuthContext(<ListProducts />);

    const headings = await screen.findAllByRole("generic", {
      name: (content, element) => element?.classList.contains("product-name"),
    });

    expect(headings).toHaveLength(2);

    const productName = await screen.findByText("Product 1");
    const productDescription = await screen.findByText("Description 1");
    const productPrice = await screen.findByText("10");

    expect(productName).toBeInTheDocument();
    expect(productDescription).toBeInTheDocument();
    expect(productPrice).toBeInTheDocument();
  });
});
