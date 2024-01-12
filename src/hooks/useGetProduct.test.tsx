import { renderHook, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import useGetProduct from "./useGetProduct";

vi.mock("aws-amplify/auth");

const { graphqlMock } = vi.hoisted(() => {
  return { graphqlMock: vi.fn() };
});

vi.mock("aws-amplify/api", () => ({
  generateClient: vi.fn(() => ({
    graphql: graphqlMock,
  })),
}));

vi.mock("../hooks/useCheckForUser", () => {
  return {
    __esModule: true,
    default: vi.fn(() => ({
      isLoggedIn: true,
    })),
  };
});

const mockProduct = {
  name: "Test Product",
  description: "Test Description",
  price: "10.99",
  id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
};

describe("useGetProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return product when getProduct resolves", async () => {
    vi.mocked(graphqlMock).mockResolvedValueOnce({
      data: {
        getProduct: mockProduct,
      },
    });

    const { result } = renderHook(() =>
      useGetProduct("372db325-5f72-49fa-ba8c-ab628c0ed470")
    );

    await waitFor(() => result.current.product !== null);

    expect(result.current.product).toEqual(mockProduct);
  });

  test("should return error message when getProduct rejects", async () => {
    vi.mocked(graphqlMock).mockResolvedValueOnce({
      data: {
        getProduct: null,
      },
      errors: ["error fetching product"],
    });

    const { result } = renderHook(() =>
      useGetProduct("372db325-5f72-49fa-ba8c-ab628c0ed470")
    );

    await waitFor(() => result.current.errorMessage !== "");

    expect(result.current.errorMessage).toBe(
      "Error fetching product with ID: 372db325-5f72-49fa-ba8c-ab628c0ed470"
    );
  });
});
