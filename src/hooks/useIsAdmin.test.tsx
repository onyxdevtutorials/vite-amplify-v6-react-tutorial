import { renderHook, act, waitFor } from "@testing-library/react";
import { fetchAuthSession } from "aws-amplify/auth";
import useIsAdmin from "./useIsAdmin";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("aws-amplify/auth");

describe("useIsAdmin", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("should set isAdmin to true if user is an admin", async () => {
    // Mock the fetchAuthSession function to return a session with admin group
    vi.mocked(fetchAuthSession).mockResolvedValueOnce({
      tokens: {
        accessToken: {
          payload: {
            "cognito:groups": ["admin"],
          },
        },
      },
    });

    const { result } = renderHook(() => useIsAdmin());

    act(() => {
      result.current.checkIsAdmin();
    });

    await waitFor(() => expect(result.current.isAdmin).toBe(true));
  });

  test("should set isAdmin to false if user is not an admin", async () => {
    // Mock the fetchAuthSession function to return a session without admin group
    vi.mocked(fetchAuthSession).mockResolvedValueOnce({
      tokens: {
        accessToken: {
          payload: {
            "cognito:groups": [],
          },
        },
      },
    });

    const { result } = renderHook(() => useIsAdmin());

    act(() => {
      result.current.checkIsAdmin();
    });

    await waitFor(() => expect(result.current.isAdmin).toBe(false));
  });
});
