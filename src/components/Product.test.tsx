import React from "react";
import { expect, test, beforeEach, vi, describe } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate, MemoryRouter } from "react-router-dom";
import Product from "./Product";
import { ProductWithReviews, Review } from "../types";

const mockProduct: ProductWithReviews = {
  __typename: "Product",
  createdAt: "2022-01-01T00:00:00Z", // Replace with a suitable date string
  updatedAt: "2022-01-01T00:00:00Z", // Replace with a suitable date string
  id: "1",
  name: "Test Product",
  description: "This is a test product",
  price: "9.99",
  reviews: {
    __typename: "ModelReviewConnection",
    items: [
      { id: "1", rating: 5, content: "Great product" } as Review,
      { id: "2", rating: 4, content: "Good product" } as Review,
    ],
  },
};

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

describe("Product", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders product list item correctly", () => {
    render(
      <MemoryRouter>
        <Product product={mockProduct} isAdmin={false} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("product name")).toHaveTextContent(
      "Test Product"
    );
    expect(screen.getByText("This is a test product")).toBeInTheDocument();
    expect(screen.getByText("9.99")).toBeInTheDocument();
    expect(screen.getByText("2 reviews")).toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("renders edit and delete buttons for admin", () => {
    render(
      <MemoryRouter>
        <Product product={mockProduct} isAdmin={true} />
      </MemoryRouter>
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("navigates to edit page when edit button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Product product={mockProduct} isAdmin={true} />
      </MemoryRouter>
    );

    const editButton = await screen.findByRole("button", { name: /Edit/i });

    await user.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith("/edit/1");
  });

  test("handles delete logic when delete button is clicked", () => {
    // TODO: Implement the test logic for handleDelete function
  });
});
