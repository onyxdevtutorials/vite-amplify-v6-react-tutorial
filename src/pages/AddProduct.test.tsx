import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddProduct } from "./";
import { MemoryRouter } from "react-router-dom";
import { createProduct } from "../graphql/mutations";
import { toast } from "react-toastify";
import { AuthContextProvider } from "../context/AuthContext";

vi.mock("aws-amplify/auth");

const { useAuthContextMock } = vi.hoisted(() => {
  return {
    useAuthContextMock: vi.fn().mockReturnValue({
      isLoggedIn: true,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: {
        userId: "1234",
        username: "testuser",
      },
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    }),
  };
});

vi.mock("../context/AuthContext", async () => {
  const actual = await vi.importActual<typeof import("../context/AuthContext")>(
    "../context/AuthContext"
  );
  return {
    ...actual,
    useAuthContext: useAuthContextMock,
  };
});

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
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const fillInForm = async (
  productName: string,
  description: string,
  price: string
) => {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(/name/i), productName);
  await user.type(screen.getByLabelText(/description/i), description);
  await user.type(screen.getByLabelText(/price/i), price);
};

const renderAddProduct = async () => {
  await waitFor(() => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <AddProduct />
        </AuthContextProvider>
      </MemoryRouter>
    );
  });
};

describe("AddProduct", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    graphqlMock.mockImplementationOnce((query) => {
      if (query === createProduct) {
        return Promise.resolve();
      }
    });

    await renderAddProduct();
  });

  test("renders Add Product page", async () => {
    expect(
      screen.getByRole("heading", { name: "Add Product" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("form", { name: "product form" })
    ).toBeInTheDocument();
  });

  test("should call createProduct mutation with the product values", async () => {
    const user = userEvent.setup();

    await fillInForm("Test Product", "Test Description", "10.99");

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
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
    });

    expect(toast.success).toHaveBeenCalledWith("Product added successfully");
  });
});
