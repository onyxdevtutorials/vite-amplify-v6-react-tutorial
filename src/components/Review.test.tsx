import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";
import { Review } from "./";
import { Review as ReviewType } from "../API";
import userEvent from "@testing-library/user-event";

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() };
});

vi.mock("react-router-dom", async () => {
  const router = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...router,
    useNavigate: vi.fn().mockReturnValue(mockNavigate),
    useParams: vi
      .fn()
      .mockReturnValue({ reviewId: "fc3c6ac8-8c05-4ea8-9f35-24dde415480e" }),
  };
});

vi.mock("aws-amplify/auth");

const mockReview: ReviewType = vi.hoisted(() => ({
  __typename: "Review",
  id: "fc3c6ac8-8c05-4ea8-9f35-24dde415480e",
  owner: "testuser",
  content: "Great product!",
  rating: 5,
  isArchived: false,
  productReviewsId: "ce55f342-9197-4379-8c3c-4418ca71b154",
  createdAt: "2022-01-01T00:00:00Z",
  updatedAt: "2022-01-01T00:00:00Z",
}));

vi.mock("../hooks/useGetReview", () => {
  const actual = vi.importActual<typeof import("../hooks/useGetReview")>(
    "../hooks/useGetReview"
  );
  return {
    ...actual,
    default: vi.fn().mockReturnValue({
      review: mockReview,
      errorMessage: null,
      isLoading: false,
    }),
  };
});

const { useAuthContextMock } = vi.hoisted(() => {
  return {
    useAuthContextMock: vi.fn().mockReturnValue({
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
    }),
  };
});

vi.mock("../context/AuthContext", async () => {
  const actual = await import("../context/AuthContext");
  return {
    ...actual,
    useAuthContext: useAuthContextMock,
  };
});

const renderComponent = async () => {
  await waitFor(async () => {
    render(
      <MemoryRouter>
        <AuthContextProvider>
          <Review />
        </AuthContextProvider>
      </MemoryRouter>
    );
  });
};

describe("Review", () => {
  describe("when user is not logged in", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      await renderComponent();
    });

    test("should render review without edit or delete buttons", async () => {
      expect(screen.getByText("Great product!")).toBeInTheDocument();
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });

  describe("when user is logged in and is owner of the review", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      vi.mocked(useAuthContextMock).mockReturnValue({
        isLoggedIn: true,
        signInStep: "",
        setSignInStep: vi.fn(),
        isAdmin: false,
        user: {
          username: "testuser",
        },
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
        confirmSignUp: vi.fn(),
        confirmSignIn: vi.fn(),
        resetAuthState: vi.fn(),
      });
      await renderComponent();
    });
    test("should render review with edit and delete buttons if user is owner of the review", async () => {
      expect(screen.getByText("Great product!")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
    test("should navigate to edit page when edit button is clicked", async () => {
      const user = userEvent.setup();
      const editButton = screen.getByRole("button", { name: "Edit" });
      await user.click(editButton);
      expect(mockNavigate).toHaveBeenCalledWith(
        "/reviews/fc3c6ac8-8c05-4ea8-9f35-24dde415480e/edit"
      );
    });
  });

  describe("when user is logged in and is not owner of the review", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      vi.mocked(useAuthContextMock).mockReturnValue({
        isLoggedIn: true,
        signInStep: "",
        setSignInStep: vi.fn(),
        isAdmin: false,
        user: {
          username: "notowner",
        },
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
        confirmSignUp: vi.fn(),
        confirmSignIn: vi.fn(),
        resetAuthState: vi.fn(),
      });
      await renderComponent();
    });
    test("should render review without edit or delete buttons if user is not owner of the review", async () => {
      expect(screen.getByText("Great product!")).toBeInTheDocument();
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });
});
