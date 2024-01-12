import { expect, test, beforeEach, vi, describe } from "vitest";
import { act } from "react-dom/test-utils";
import { render, screen } from "@testing-library/react";
import { GetProductWithReviewsQuery } from "../API";
import ProductDetail from "./ProductDetail";
import { MemoryRouter } from "react-router-dom";
import useCheckForUser from "../hooks/useCheckForUser";
import useIsAdmin from "../hooks/useIsAdmin";

vi.mock("../hooks/useCheckForUser");
vi.mock("../hooks/useIsAdmin");

const { graphqlMock } = vi.hoisted(() => {
  const mockProduct: GetProductWithReviewsQuery["getProduct"] = {
    __typename: "Product",
    id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
    name: "Test Product",
    description: "This is a test product",
    price: "9.99",
    isArchived: false,
    createdAt: "2022-01-01T00:00:00Z",
    updatedAt: "2022-01-01T00:00:00Z",
    reviews: {
      __typename: "ModelReviewConnection",
      items: [
        {
          __typename: "Review",
          id: "1",
          owner: "John Doe",
          content: "Great product!",
          rating: 5,
          isArchived: false,
          productReviewsId: "372db325-5f72-49fa-ba8c-ab628c0ed470",
          createdAt: "2022-01-01T00:00:00Z",
          updatedAt: "2022-01-01T00:00:00Z",
        },
        {
          __typename: "Review",
          id: "2",
          owner: "Jane Smith",
          content: "Not so good",
          rating: 2,
          isArchived: false,
          productReviewsId: "372db325-5f72-49fa-ba8c-ab628c0ed470",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
      ],
    },
  };

  const graphqlMock = vi.fn().mockResolvedValue({
    data: {
      getProduct: mockProduct,
    },
    errors: null,
  });

  return { mockProduct, graphqlMock };
});

vi.mock("aws-amplify/api", () => ({
  generateClient: vi.fn(() => ({
    graphql: graphqlMock,
  })),
}));

vi.mock("react-router-dom", async () => {
  const router = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...router,
    useParams: vi
      .fn()
      .mockReturnValue({ productId: "372db325-5f72-49fa-ba8c-ab628c0ed470" }),
  };
});

vi.mock("aws-amplify/auth");

vi.mock("aws-amplify/api", () => ({
  generateClient: vi.fn(() => ({
    graphql: graphqlMock,
  })),
}));

const renderProductDetail = async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <ProductDetail />
      </MemoryRouter>
    );
  });
};

describe("ProductDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders product details", async () => {
    // Test fails when using mockResolvedValueOnce
    vi.mocked(useCheckForUser).mockResolvedValue({
      isLoggedIn: true,
      user: { userId: "1", username: "testuser" },
      checkUser: vi.fn(),
    });

    // Test fails when using mockResolvedValueOnce
    vi.mocked(useIsAdmin).mockResolvedValue({
      isAdmin: true,
      checkIsAdmin: vi.fn(),
    });

    await renderProductDetail();

    screen.debug();

    expect(screen.getByText("Test Product")).toBeInTheDocument();

    expect(screen.getByText("This is a test product")).toBeInTheDocument();

    expect(screen.getByText("9.99")).toBeInTheDocument();

    expect(screen.getByText("2 reviews")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { level: 2, name: "Reviews" })
    ).toBeInTheDocument();

    expect(screen.getByText("John Doe")).toBeInTheDocument();

    expect(screen.getByText("Great product!")).toBeInTheDocument();

    expect(screen.getByText("Rating: 5")).toBeInTheDocument();

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    expect(screen.getByText("Not so good")).toBeInTheDocument();

    expect(screen.getByText("Rating: 2")).toBeInTheDocument();
  });
});
