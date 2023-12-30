import { expect, test, beforeEach, vi, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Product from "./Product";
import { ProductWithReviews, Review } from "../types";
import { archiveProduct, restoreProduct } from "../graphql/customMutations";

const mockProduct: ProductWithReviews = {
  __typename: "Product",
  createdAt: "2022-01-01T00:00:00Z",
  updatedAt: "2022-01-01T00:00:00Z",
  id: "1",
  name: "Test Product",
  description: "This is a test product",
  price: "9.99",
  isArchived: false,
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

const { graphqlMock } = vi.hoisted(() => {
  return { graphqlMock: vi.fn() };
});

vi.mock("aws-amplify/api", () => ({
  generateClient: vi.fn(() => ({
    graphql: graphqlMock,
  })),
}));

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
    expect(
      screen.queryByRole("button", { name: /edit/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /archive/i })
    ).not.toBeInTheDocument();
  });

  test("renders edit and archive buttons for admin", () => {
    render(
      <MemoryRouter>
        <Product product={mockProduct} isAdmin={true} />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /archive/i })
    ).toBeInTheDocument();
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

  test("handles archive logic when archive button is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(graphqlMock).mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Product product={mockProduct} isAdmin={true} />
      </MemoryRouter>
    );

    const archiveButton = await screen.findByRole("button", {
      name: /Archive/i,
    });

    expect(archiveButton).toBeInTheDocument();

    await user.click(archiveButton);

    expect(graphqlMock).toHaveBeenCalledWith({
      query: archiveProduct,
      variables: { id: mockProduct.id },
    });

    expect(
      await screen.findByRole("button", { name: /Restore/i })
    ).toBeInTheDocument();
  });

  test("handles restore logic when restore button is clicked", async () => {
    const user = userEvent.setup();

    const archivedProduct = {
      ...mockProduct,
      isArchived: true,
    };

    vi.mocked(graphqlMock).mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <Product product={archivedProduct} isAdmin={true} />
      </MemoryRouter>
    );

    const restoreButton = await screen.findByRole("button", {
      name: /restore/i,
    });

    expect(restoreButton).toBeInTheDocument();

    await user.click(restoreButton);

    expect(graphqlMock).toHaveBeenCalledWith({
      query: restoreProduct,
      variables: { id: mockProduct.id },
    });

    expect(
      await screen.findByRole("button", { name: /archive/i })
    ).toBeInTheDocument();
  });
});
