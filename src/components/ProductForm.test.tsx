import { vi, expect, describe, test, beforeEach } from "vitest";
import ProductForm from "./ProductForm";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { uploadData, UploadDataOutput } from "aws-amplify/storage";

type TestTransferTaskState =
  | "IN_PROGRESS"
  | "PAUSED"
  | "CANCELED"
  | "SUCCESS"
  | "ERROR";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("aws-amplify/storage");

describe("ProductForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Product Form", () => {
    render(
      <MemoryRouter>
        <ProductForm
          initialValues={{ name: "", description: "", price: "" }}
          onSubmit={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("textbox", { name: /product name/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /description/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /price/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("should call uploadData() with the image file when the file is selected", async () => {
    const user = userEvent.setup();

    const mockUploadDataOutput: UploadDataOutput = {
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      state: "SUCCESS" as TestTransferTaskState,
      result: Promise.resolve({ key: "chucknorris.png" }),
    };

    vi.mocked(uploadData).mockResolvedValue(mockUploadDataOutput);

    const file = new File(["(⌐□_□)"], "chucknorris.png", {
      type: "image/png",
    });

    render(
      <MemoryRouter>
        <ProductForm
          initialValues={{ name: "", description: "", price: "" }}
          onSubmit={vi.fn()}
        />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/image/i);
    await user.upload(input, file);

    expect(uploadData).toHaveBeenCalledWith({
      key: file.name,
      data: file,
      options: {
        accessLevel: "guest",
        onProgress: expect.any(Function),
      },
    });
  });

  test("should call onSubmit() with the form values and image key when the form is submitted", async () => {
    const user = userEvent.setup();

    const mockUploadDataOutput: UploadDataOutput = {
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      state: "SUCCESS" as TestTransferTaskState,
      result: Promise.resolve({ key: "chucknorris.png" }),
    };

    vi.mocked(uploadData).mockResolvedValue(mockUploadDataOutput);

    const file = new File(["(⌐□_□)"], "chucknorris.png", {
      type: "image/png",
    });

    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <ProductForm
          initialValues={{ name: "", description: "", price: "" }}
          onSubmit={onSubmit}
        />
      </MemoryRouter>
    );

    const productNameInput = screen.getByLabelText(/product name/i);
    await user.type(productNameInput, "Test Product");

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, "Test Description");

    const priceInput = screen.getByLabelText(/price/i);
    await user.type(priceInput, "10.99");

    const imageInput = screen.getByLabelText(/image/i);
    await user.upload(imageInput, file);

    await waitFor(() => {
      expect(uploadData).toHaveBeenCalledWith({
        key: file.name,
        data: file,
        options: {
          accessLevel: "guest",
          onProgress: expect.any(Function),
        },
      });
      expect(toast.success).toHaveBeenCalledWith("Image uploaded successfully");
    });

    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: "Test Product",
        description: "Test Description",
        price: "10.99",
        image: "chucknorris.png",
      },
      expect.anything()
    );
  });

  test("should display an error toast if the image upload fails", async () => {
    const user = userEvent.setup();

    const file = new File(["(⌐□_□)"], "chucknorris.png", {
      type: "image/png",
    });

    vi.mocked(uploadData).mockImplementationOnce(() => ({
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      state: "ERROR" as TestTransferTaskState,
      result: Promise.reject(new Error("Upload failed")),
    }));

    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <ProductForm
          initialValues={{ name: "", description: "", price: "" }}
          onSubmit={onSubmit}
        />
      </MemoryRouter>
    );

    const imageInput = screen.getByLabelText(/image/i);
    await user.upload(imageInput, file);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Error uploading image")
    );
  });
});
