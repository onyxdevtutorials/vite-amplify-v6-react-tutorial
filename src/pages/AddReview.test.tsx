import { render, screen, waitFor } from "@testing-library/react";
import AddReview from "./AddReview";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { createReview } from "../graphql/mutations";
import { toast } from "react-toastify";
import useGetProduct from "../hooks/useGetProduct";
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
  },
}));

vi.mock("../hooks/useGetProduct");

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

const mockReview = {
  rating: 5,
  content: "Test Review",
  productReviewsId: "372db325-5f72-49fa-ba8c-ab628c0ed470",
  userReviewsId: "1234",
};

const renderAddReview = async () => {
  await waitFor(() => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <AddReview />
        </AuthContextProvider>
      </MemoryRouter>
    );
  });
};

describe("AddReview", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(useGetProduct).mockImplementation((productId) => {
      if (productId === "372db325-5f72-49fa-ba8c-ab628c0ed470") {
        return {
          product: {
            __typename: "Product",
            name: "Test Product",
            description: "Test Description",
            price: "10.99",
            id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
            createdAt: "2021-08-01T00:00:00.000Z",
            updatedAt: "2021-08-01T00:00:00.000Z",
            isArchived: false,
            reviews: {
              nextToken: null,
              __typename: "ModelReviewConnection",
            },
          },
          isLoading: false,
          errorMessage: "",
        };
      } else {
        return {
          product: null,
          isLoading: false,
          errorMessage: "No product found",
        };
      }
    });

    await renderAddReview();
  });

  test("renders AddReview form", async () => {
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const ratingInput = screen.getByLabelText(/rating/i);
    const contentInput = screen.getByRole("textbox", { name: /review/i });
    const button = screen.getByRole("button", { name: /submit/i });

    expect(ratingInput).toBeInTheDocument();
    expect(contentInput).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  test("displays validation errors when form is submitted with invalid data", async () => {
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const ratingInput = screen.getByLabelText(/rating/i);
    const contentInput = screen.getByRole("textbox", { name: /review/i });
    const button = screen.getByRole("button", { name: /submit/i });

    await user.clear(ratingInput);
    await user.clear(contentInput);

    // Submit the form without filling in any fields
    // Actually, submit button should be disabled until rating and content are filled in
    await user.click(button);
    expect(button).toBeDisabled();

    const requiredInputs = screen.getAllByText("Required");

    expect(requiredInputs.length).toBe(2);
  });

  test("calls createReview mutation with correct variables when form is submitted with valid data", async () => {
    const user = userEvent.setup();

    vi.mocked(graphqlMock).mockResolvedValueOnce({
      data: {
        createReview: mockReview,
      },
    });

    await user.type(
      screen.getByLabelText(/rating/i),
      mockReview.rating.toString()
    );
    await user.type(
      screen.getByRole("textbox", { name: /review/i }),
      mockReview.content
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(graphqlMock).toHaveBeenCalled());

    expect(graphqlMock).toHaveBeenCalledWith({
      query: createReview,
      variables: {
        input: mockReview,
      },
    });
  });

  test("displays success message when review is added successfully", async () => {
    const user = userEvent.setup();

    vi.mocked(graphqlMock).mockResolvedValueOnce({
      data: {
        createReview: mockReview,
      },
    });

    await user.type(
      screen.getByLabelText(/rating/i),
      mockReview.rating.toString()
    );
    await user.type(
      screen.getByRole("textbox", { name: /review/i }),
      mockReview.content
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(graphqlMock).toHaveBeenCalled());

    expect(toast.success).toHaveBeenCalledWith("Review added successfully");
  });
});

describe("AddReview - Error Handling", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(useAuthContextMock).mockClear().mockReturnValueOnce({
      isLoggedIn: false,
      signInStep: "",
      setSignInStep: vi.fn(),
      isAdmin: false,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      confirmSignUp: vi.fn(),
      confirmSignIn: vi.fn(),
      resetAuthState: vi.fn(),
    });

    vi.mocked(useGetProduct).mockImplementation((productId) => {
      if (productId === "372db325-5f72-49fa-ba8c-ab628c0ed470") {
        return {
          product: {
            __typename: "Product",
            name: "Test Product",
            description: "Test Description",
            price: "10.99",
            id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
            createdAt: "2021-08-01T00:00:00.000Z",
            updatedAt: "2021-08-01T00:00:00.000Z",
            isArchived: false,
            reviews: {
              nextToken: null,
              __typename: "ModelReviewConnection",
            },
          },
          isLoading: false,
          errorMessage: "",
        };
      } else {
        return {
          product: null,
          isLoading: false,
          errorMessage: "No product found",
        };
      }
    });

    await renderAddReview();
  });
  test("should not show review form if user is not logged in", async () => {
    expect(
      screen.getByText("Please sign in to add a review")
    ).toBeInTheDocument();
  });
});
