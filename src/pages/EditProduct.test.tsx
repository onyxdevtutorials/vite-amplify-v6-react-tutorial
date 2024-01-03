import { describe, expect, test, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { updateProduct } from "../graphql/mutations";
import EditProduct from "./EditProduct";
import { getProduct } from "../graphql/queries";

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

const { graphqlMock } = vi.hoisted(() => {
  return { graphqlMock: vi.fn() };
});

vi.mock("aws-amplify/api", () => ({
  generateClient: vi.fn(() => ({
    graphql: graphqlMock,
  })),
}));

vi.mock("aws-amplify/auth");

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

describe("EditProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders EditProduct page, showing form containing test data", async () => {
    const mockProduct = {
      name: "Test Product",
      description: "Test Description",
      price: "10.99",
      productId: "372db325-5f72-49fa-ba8c-ab628c0ed470",
    };

    const newValues = {
      name: "Test Product",
      description: "New Test Description",
      price: "10.99",
      productId: "372db325-5f72-49fa-ba8c-ab628c0ed470",
    };

    vi.mocked(graphqlMock)
      .mockResolvedValueOnce({
        data: {
          getProduct: mockProduct,
        },
      })
      .mockResolvedValueOnce({
        data: {
          updateProduct: { ...mockProduct, ...newValues },
        },
      });

    render(
      <MemoryRouter>
        <EditProduct />
      </MemoryRouter>
    );

    await waitFor(async () => {
      expect(
        await screen.findByRole("form", { name: /^edit product form$/i })
      ).toBeInTheDocument();
    });

    expect(graphqlMock).toHaveBeenCalledTimes(1);
    expect(graphqlMock.mock.calls[0][0]).toEqual({
      query: getProduct,
      variables: { id: "372db325-5f72-49fa-ba8c-ab628c0ed470" },
    });

    const productNameInput = await screen.findByRole("textbox", {
      name: /product name/i,
    });
    const descriptionInput = await screen.findByRole("textbox", {
      name: /description/i,
    });
    const priceInput = await screen.findByRole("textbox", { name: /price/i });

    expect(productNameInput).toHaveValue("Test Product");
    expect(descriptionInput).toHaveValue("Test Description");
    expect(priceInput).toHaveValue("10.99");
  });

  test("calls graphql() with updated product data when form is submitted", async () => {
    const user = userEvent.setup();

    vi.mocked(graphqlMock)
      .mockResolvedValueOnce({
        data: {
          getProduct: mockProduct,
        },
      })
      .mockResolvedValueOnce({
        data: {
          updateProduct: { ...mockProduct, ...newValues },
        },
      });

    render(
      <MemoryRouter>
        <EditProduct />
      </MemoryRouter>
    );

    const form = await screen.findByRole("form", {
      name: /^edit product form$/i,
    });

    expect(form).toBeInTheDocument();

    // Fill in the form fields
    const productNameInput = screen.getByRole("textbox", {
      name: /product name/i,
    });
    const descriptionInput = screen.getByRole("textbox", {
      name: /description/i,
    });
    const priceInput = screen.getByRole("textbox", { name: /price/i });

    await user.clear(productNameInput);
    await user.type(productNameInput, "Test Product");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "New Test Description");
    await user.clear(priceInput);
    await user.type(priceInput, "10.99");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /update/i }));

    // Assert that graphql() was called with the updated product data
    waitFor(() => {
      expect(graphqlMock.mock.calls[1][0]).toEqual({
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
    vi.mocked(graphqlMock).mockImplementation(({ query }) => {
      if (query === getProduct) {
        return Promise.reject(new Error("Error getting product"));
      }
    });

    render(
      <MemoryRouter>
        <EditProduct />
      </MemoryRouter>
    );

    const alert = await screen.findByRole("alert");
    screen.debug();

    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Error getting product");
  });

  test("displays an alert message if updating the product fails", async () => {
    const user = userEvent.setup();

    // Mock successful fetch
    vi.mocked(graphqlMock).mockImplementation(({ query }) => {
      if (query === updateProduct) {
        return Promise.reject(new Error("Error updating product"));
      } else if (query === getProduct) {
        return Promise.resolve({
          data: {
            getProduct: mockProduct,
          },
        });
      }
    });

    render(
      <MemoryRouter>
        <EditProduct />
      </MemoryRouter>
    );

    const form = await screen.findByRole("form", {
      name: /^edit product form$/i,
    });

    expect(form).toBeInTheDocument();

    // Simulate user actions that trigger the update...
    // Fill in the form fields
    const productNameInput = screen.getByRole("textbox", {
      name: /product name/i,
    });
    const descriptionInput = screen.getByRole("textbox", {
      name: /description/i,
    });
    const priceInput = screen.getByRole("textbox", { name: /price/i });

    await user.clear(productNameInput);
    await user.type(productNameInput, "Test Product");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "New Test Description");
    await user.clear(priceInput);
    await user.type(priceInput, "10.99");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /update/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Error updating product");
  });
});
