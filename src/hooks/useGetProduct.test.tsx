import { renderHook, waitFor } from "@testing-library/react";
import { AuthContextProvider } from "../context/AuthContext";
import useGetProduct from "./useGetProduct";
import { ReactNode } from "react";

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

const mockProduct = {
  name: "Test Product",
  description: "Test Description",
  price: "10.99",
  id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
};

describe("useGetProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return product when getProduct resolves for logged in user", async () => {
    vi.mocked(graphqlMock).mockResolvedValueOnce({
      data: {
        getProduct: mockProduct,
      },
    });

    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetProduct("372db325-5f72-49fa-ba8c-ab628c0ed470"),
      { wrapper }
    );

    await waitFor(() => result.current.product !== null);

    expect(result.current.product).toEqual(mockProduct);
  });

  test("should return error message when getProduct rejects", async () => {
    vi.mocked(graphqlMock).mockResolvedValueOnce({
      data: {
        getProduct: null,
      },
      errors: ["error fetching product"],
    });

    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetProduct("372db325-5f72-49fa-ba8c-ab628c0ed470"),
      { wrapper }
    );

    await waitFor(() => result.current.errorMessage !== "");

    expect(result.current.errorMessage).toBe(
      "Error fetching product with ID: 372db325-5f72-49fa-ba8c-ab628c0ed470"
    );
  });

  test("should return product even for anonymous user", async () => {
    vi.mocked(useAuthContextMock).mockReturnValueOnce({
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
    vi.mocked(graphqlMock).mockResolvedValueOnce({
      data: {
        getProduct: mockProduct,
      },
    });

    const wrapper = ({ children }: { children?: ReactNode }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );

    const { result } = renderHook(
      () => useGetProduct("372db325-5f72-49fa-ba8c-ab628c0ed470"),
      { wrapper }
    );

    await waitFor(() => result.current.product !== null);

    expect(result.current.product).toEqual(mockProduct);
  });
});
