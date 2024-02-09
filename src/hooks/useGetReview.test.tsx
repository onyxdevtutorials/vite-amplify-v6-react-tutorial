import { renderHook, waitFor } from "@testing-library/react";
import { AuthContextProvider } from "../context/AuthContext";
import useGetReview from "./useGetReview";
import { ReactNode } from "react";
import { GraphQLError } from "graphql";

vi.mock("aws-amplify/auth");

const { graphqlMock } = vi.hoisted(() => {
  return { graphqlMock: vi.fn() };
});

vi.mock("aws-amplify/api", () => ({
  generateClient: vi.fn(() => ({
    graphql: graphqlMock,
  })),
}));

const { useAuthContextMock } = vi.hoisted(() => {
  return {
    useAuthContextMock: vi.fn().mockReturnValue({
      isLoggedIn: true,
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

const mockReview = {
  id: "795f1735-60b8-47bc-a061-8537cc4cfe7c",
  product: {
    id: "b6e271b4-c7e0-4d3d-a7aa-5f4966ef5688",
    name: "another product",
    description: "another description",
    price: "333",
    isArchived: null,
    image: "2024-jeep-recon-101-1662583242.jpg",
    createdAt: "2024-02-06T02:38:08.320Z",
    updatedAt: "2024-02-06T02:38:08.320Z",
    owner: null,
    __typename: "Product",
  },
  rating: 2,
  content: "written by testuser99",
  isArchived: null,
  user: {
    id: "bbc98375-b793-4aee-a59a-7872975cd905",
    username: "testuser99",
    firstName: "test",
    lastName: "user99",
    isArchived: null,
    createdAt: "2024-02-09T03:05:38.899Z",
    updatedAt: "2024-02-09T03:11:38.637Z",
    owner: "bbc98375-b793-4aee-a59a-7872975cd905",
    __typename: "User",
  },
  createdAt: "2024-02-09T03:07:23.797Z",
  updatedAt: "2024-02-09T03:07:23.797Z",
  productReviewsId: "b6e271b4-c7e0-4d3d-a7aa-5f4966ef5688",
  userReviewsId: "bbc98375-b793-4aee-a59a-7872975cd905",
  owner: "testuser99",
  __typename: "Review",
};

describe("useGetReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(graphqlMock).mockImplementation(({ variables }) => {
      if (variables.id === "795f1735-60b8-47bc-a061-8537cc4cfe7c") {
        return Promise.resolve({
          data: {
            getReview: mockReview,
          },
        });
      }

      return Promise.reject(new GraphQLError("Review not found"));
    });
  });

  test("should return review for given reviewId", async () => {
    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetReview("795f1735-60b8-47bc-a061-8537cc4cfe7c"),
      { wrapper }
    );

    await waitFor(() => result.current.review !== null);

    expect(result.current.review).toEqual(mockReview);
    expect(result.current.errorMessage).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  test("should return null if review is not found", async () => {
    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetReview("795f1735-60b8-47bc-a061-8537cc4cfe7d"),
      { wrapper }
    );

    await waitFor(() => result.current.errorMessage !== "");

    expect(result.current.review).toBe(null);
    expect(result.current.errorMessage).toBe("Review not found");
    expect(result.current.isLoading).toBe(false);
  });
});
