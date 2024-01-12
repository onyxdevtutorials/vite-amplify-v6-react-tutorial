import { describe, expect, test, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AddProduct from "./AddProduct";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { createProduct } from "../graphql/mutations";
import { toast } from "react-toastify";
import { uploadData, UploadDataOutput } from "aws-amplify/storage";

vi.mock("aws-amplify/storage");

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
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const renderAddProduct = () => {
  render(
    <MemoryRouter>
      <AddProduct />
    </MemoryRouter>
  );
};

describe("AddProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Add Product form", () => {
    renderAddProduct();

    // Assert that the form elements are rendered
    expect(
      screen.getByRole("textbox", { name: /product name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /description/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /price/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("displays validation errors when form is submitted with invalid data", async () => {
    const user = userEvent.setup();

    renderAddProduct();

    // Submit the form without filling in any fields
    await user.click(screen.getByRole("button", { name: /submit/i }));

    const requiredInputs = screen.getAllByText("Required");

    expect(requiredInputs).toHaveLength(3);
  });

  test("submits the form with valid data and calls graphql()", async () => {
    const user = userEvent.setup();

    renderAddProduct();

    // Fill in the form fields
    await user.type(screen.getByLabelText("Product Name"), "Test Product");
    await user.type(screen.getByLabelText("Description"), "Test Description");
    await user.type(screen.getByLabelText("Price"), "10.99");

    // Submit the form
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(graphqlMock).toHaveBeenCalledWith({
      query: createProduct,
      variables: {
        input: {
          name: "Test Product",
          description: "Test Description",
          price: "10.99",
          image: "",
        },
      },
    });

    // Assert that the success toast is called
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
      "Product added successfully"
    );
  });

  test("should call uploadData() when a file is selected", async () => {
    const user = userEvent.setup();

    vi.mocked(uploadData).mockResolvedValueOnce({
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      state: "complete",
      result: Promise.resolve({ key: "chucknorris.png" }),
    } as unknown as UploadDataOutput);

    const file = new File(["(⌐□_□)"], "chucknorris.png", {
      type: "image/png",
    });

    renderAddProduct();

    await user.upload(screen.getByLabelText("Image"), file);

    expect(uploadData).toHaveBeenCalledWith({
      key: file.name,
      data: file,
      options: {
        accessLevel: "guest",
        onProgress: expect.any(Function),
      },
    });
  });
});
