import { describe, expect, test, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AddProduct from "./AddProduct";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { createProduct } from "../graphql/mutations";
import { toast } from "react-toastify";

const { graphqlMock } = vi.hoisted(() => {
  return { graphqlMock: vi.fn() };
});

vi.mock("aws-amplify/api", () => ({
  generateClient: () => ({
    graphql: graphqlMock,
  }),
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe("AddProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Add Product form", () => {
    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Assert that the form elements are rendered
    expect(
      screen.getByRole("textbox", { name: /product name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /description/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /price/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  test("displays validation errors when form is submitted with invalid data", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Submit the form without filling in any fields
    await user.click(screen.getByRole("button", { name: /add/i }));

    const requiredInputs = screen.getAllByText("Required");

    expect(requiredInputs).toHaveLength(3);
  });

  test("submits the form with valid data and calls graphql()", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Fill in the form fields
    await user.type(screen.getByLabelText("Product Name"), "Test Product");
    await user.type(screen.getByLabelText("Description"), "Test Description");
    await user.type(screen.getByLabelText("Price"), "10.99");

    // Submit the form
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(graphqlMock).toHaveBeenCalledWith({
      query: createProduct,
      variables: {
        input: {
          name: "Test Product",
          description: "Test Description",
          price: "10.99",
        },
      },
    });

    // Assert that the success toast is called
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
      "Product added successfully"
    );
  });
});
