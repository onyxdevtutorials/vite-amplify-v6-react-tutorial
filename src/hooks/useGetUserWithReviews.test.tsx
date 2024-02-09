import { renderHook, waitFor } from "@testing-library/react";
import { AuthContextProvider } from "../context/AuthContext";
import useGetUserWithReviews from "./useGetUserWithReviews";
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

const mockUserWithReviews = {
  id: "bbc98375-b793-4aee-a59a-7872975cd90",
  username: "testuser99",
  firstName: "test",
  lastName: "user99",
  isArchived: null,
  createdAt: "2024-02-09T03:05:38.899Z",
  updatedAt: "2024-02-09T03:11:38.637Z",
  owner: "bbc98375-b793-4aee-a59a-7872975cd905",
  reviews: {
    items: [
      {
        id: "795f1735-60b8-47bc-a061-8537cc4cfe7c",
        rating: 2,
        content: "written by testuser99",
        isArchived: null,
        createdAt: "2024-02-09T03:07:23.797Z",
        updatedAt: "2024-02-09T03:07:23.797Z",
        productReviewsId: "b6e271b4-c7e0-4d3d-a7aa-5f4966ef5688",
        userReviewsId: "bbc98375-b793-4aee-a59a-7872975cd905",
        owner: "testuser99",
        __typename: "Review",
      },
    ],
    nextToken: null,
    __typename: "ModelReviewConnection",
  },
  __typename: "User",
};

describe("useGetUserWithReviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(graphqlMock).mockImplementation(({ variables }) => {
      if (variables.id === "bbc98375-b793-4aee-a59a-7872975cd90") {
        return Promise.resolve({
          data: {
            getUser: mockUserWithReviews,
          },
        });
      } else {
        return Promise.reject(new GraphQLError("User not found"));
      }
    });
  });

  test("should return user with reviews for given userId", async () => {
    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetUserWithReviews("bbc98375-b793-4aee-a59a-7872975cd90"),
      {
        wrapper,
      }
    );

    await waitFor(() => result.current.userWithReviews !== null);

    expect(result.current.userWithReviews).toEqual(mockUserWithReviews);
    expect(result.current.errorMessage).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  test("should return null if user not found", async () => {
    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetUserWithReviews("bbc98375-b793-4aee-a59a-7872975cd91"),
      {
        wrapper,
      }
    );

    await waitFor(() => result.current.errorMessage !== "");

    expect(result.current.userWithReviews).toBe(null);
    expect(result.current.errorMessage).toBe(
      "Error fetching user with ID bbc98375-b793-4aee-a59a-7872975cd91: User not found"
    );
    expect(result.current.isLoading).toBe(false);
  });
});
