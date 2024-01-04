import { expect, test, beforeEach, vi, describe } from "vitest";
import { act } from "react-dom/test-utils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GetProductWithReviewsQuery } from "../API";
import ProductDetail from "./ProductDetail";
import { MemoryRouter } from "react-router-dom";
import useCheckForUser from "../hooks/useCheckForUser";
import useIsAdmin from "../hooks/useIsAdmin";
import { generateClient } from "aws-amplify/api";

vi.mock("../hooks/useCheckForUser");
vi.mock("../hooks/useIsAdmin");

const { mockProduct, graphqlMock } = vi.hoisted(() => {
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

describe("ProductDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test.only("renders product details", async () => {
    vi.mocked(useCheckForUser).mockResolvedValue({
      isLoggedIn: true,
      user: { userId: "1", username: "testuser" },
      checkUser: vi.fn(),
    });

    vi.mocked(useIsAdmin).mockResolvedValue({
      isAdmin: true,
      checkIsAdmin: vi.fn(),
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <ProductDetail />
        </MemoryRouter>
      );
    });

    screen.debug();
  });
});
