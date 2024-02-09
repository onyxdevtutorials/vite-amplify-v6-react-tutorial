import { renderHook, waitFor } from "@testing-library/react";
import { AuthContextProvider } from "../context/AuthContext";
import useGetUser from "./useGetUser";
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

const mockUser = {
  id: "bbc98375-b793-4aee-a59a-7872975cd905",
  username: "testuser99",
  firstName: "test",
  lastName: "user99",
  isArchived: null,
  reviews: {
    nextToken: null,
    __typename: "ModelReviewConnection",
  },
  createdAt: "2024-02-09T03:05:38.899Z",
  updatedAt: "2024-02-09T03:11:38.637Z",
  owner: "bbc98375-b793-4aee-a59a-7872975cd905",
  __typename: "User",
};

describe("useGetUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(graphqlMock).mockImplementation(({ variables }) => {
      if (variables.id === "bbc98375-b793-4aee-a59a-7872975cd905") {
        return Promise.resolve({
          data: { getUser: mockUser },
        });
      }

      return Promise.reject(new GraphQLError("User not found"));
    });
  });

  test("should return user for given userId", async () => {
    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetUser("bbc98375-b793-4aee-a59a-7872975cd905"),
      {
        wrapper,
      }
    );

    await waitFor(() => result.current.user !== null);

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.errorMessage).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  test("should return null user and error message for invalid userId", async () => {
    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetUser("bbc98375-b793-4aee-a59a-7872975cd90"),
      {
        wrapper,
      }
    );

    await waitFor(() => result.current.errorMessage !== "");

    expect(result.current.user).toBe(null);
    expect(result.current.errorMessage).toBe(
      "Error fetching user with ID bbc98375-b793-4aee-a59a-7872975cd90: User not found"
    );
    expect(result.current.isLoading).toBe(false);
  });
});
