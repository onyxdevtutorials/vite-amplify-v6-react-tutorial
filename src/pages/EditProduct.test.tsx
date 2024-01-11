import { describe, expect, test, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useParams } from "react-router-dom";
import { updateProduct } from "../graphql/mutations";
import EditProduct from "./EditProduct";
import useGetProduct from "../hooks/useGetProduct";
import { toast } from "react-toastify";

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

vi.mock("../hooks/useGetProduct", () => {
  const actual = vi.importActual<typeof import("../hooks/useGetProduct")>(
    "../hooks/useGetProduct"
  );
  return {
    ...actual,
    default: vi.fn().mockReturnValue({
      product: {
        name: "Test Product",
        description: "Test Description",
        price: "10.99",
        id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
        image: "chuck-norris.jpg",
      },
      errorMessage: null,
      isLoading: false,
    }),
  };
});

const { graphqlMock } = vi.hoisted(() => {
  return {
    graphqlMock: vi.fn().mockImplementation((query, variables) => {
      if (query === updateProduct) {
        return Promise.resolve({
          data: {
            updateProduct: {
              name: "Test Product",
              description: "New Test Description",
              price: "10.99",
              id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
              image: "chuck-norris.jpg",
            },
          },
        });
      }
    }),
  };
});

vi.mock("aws-amplify/api", () => ({
  generateClient: vi.fn(() => ({
    graphql: graphqlMock,
  })),
}));

vi.mock("aws-amplify/auth");

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProduct = {
  name: "Test Product",
  description: "Test Description",
  price: "10.99",
  id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
};

const newValues = {
  name: "Test Product",
  description: "New Test Description",
  price: "10.99",
};

const fillInForm = async (
  productName: string,
  description: string,
  price: string
) => {
  const user = userEvent.setup();

  const productNameInput = screen.getByRole("textbox", {
    name: /product name/i,
  });
  const descriptionInput = screen.getByRole("textbox", {
    name: /description/i,
  });
  const priceInput = screen.getByRole("textbox", { name: /price/i });

  await user.clear(productNameInput);
  await user.type(productNameInput, productName);
  await user.clear(descriptionInput);
  await user.type(descriptionInput, description);
  await user.clear(priceInput);
  await user.type(priceInput, price);
};

const renderEditProduct = () => {
  render(
    <MemoryRouter>
      <EditProduct />
    </MemoryRouter>
  );
};

describe("EditProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders EditProduct page, showing form containing test data", async () => {
    vi.mocked(useParams).mockReturnValueOnce({
      productId: mockProduct.id,
    });

    renderEditProduct();

    await waitFor(async () => {
      expect(
        await screen.findByRole("form", { name: /product form/i })
      ).toBeInTheDocument();
    });

    expect(useGetProduct).toHaveBeenCalledWith(mockProduct.id);
  });

  test("calls graphql() with updated product data when form is submitted", async () => {
    const user = userEvent.setup();

    vi.mocked(useGetProduct).mockReturnValueOnce({
      product: {
        __typename: "Product",
        id: "some-id",
        name: "some-name",
        description: "some-description",
        price: "some-price",
        isArchived: false,
        reviews: null,
        image: undefined,
        createdAt: "2022-01-01T00:00:00Z",
        updatedAt: "2022-01-01T00:00:00Z",
        owner: undefined,
      },
      errorMessage: "",
      isLoading: false,
    });

    graphqlMock.mockImplementationOnce(({ query }) => {
      if (query === updateProduct) {
        return Promise.resolve({
          data: {
            updateProduct: {
              name: "Test Product",
              description: "New Test Description",
              price: "10.99",
              id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
              image: "chuck-norris.jpg",
            },
          },
        });
      }
    });

    renderEditProduct();

    const form = await screen.findByRole("form", {
      name: /^product form$/i,
    });

    expect(form).toBeInTheDocument();

    await fillInForm("Test Product", "New Test Description", "10.99");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /submit/i }));

    // Assert that graphql() was called with the updated product data
    waitFor(() => {
      expect(graphqlMock).toHaveBeenCalledWith({
        query: updateProduct,
        variables: {
          input: {
            id: mockProduct.id,
            ...newValues,
          },
        },
      });
    });
  });

  test("displays an alert message if getting the product fails, e.g., the product doesn't exist", async () => {
    vi.mocked(useGetProduct).mockReturnValueOnce({
      product: null,
      errorMessage: "Error getting product",
      isLoading: false,
    });

    renderEditProduct();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringMatching(/error getting product/i)
      );
    });
  });

  test("displays an alert message if updating the product fails", async () => {
    const user = userEvent.setup();

    vi.mocked(useGetProduct).mockReturnValueOnce({
      product: {
        __typename: "Product",
        id: "some-id",
        name: "some-name",
        description: "some-description",
        price: "some-price",
        isArchived: false,
        reviews: null,
        image: undefined,
        createdAt: "2022-01-01T00:00:00Z",
        updatedAt: "2022-01-01T00:00:00Z",
        owner: undefined,
      },
      errorMessage: "",
      isLoading: false,
    });

    graphqlMock.mockImplementationOnce(({ query }) => {
      if (query === updateProduct) {
        return Promise.reject(new Error("Error updating product"));
      }
    });

    renderEditProduct();

    const form = await screen.findByRole("form", {
      name: /^product form$/i,
    });

    expect(form).toBeInTheDocument();

    await fillInForm("Test Product", "New Test Description", "10.99");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringMatching(/error updating product/i)
      );
    });
  });
});
