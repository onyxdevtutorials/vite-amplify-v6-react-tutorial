import { renderHook, act, waitFor } from "@testing-library/react";
import { getCurrentUser } from "aws-amplify/auth";
import useCheckForUser from "./useCheckForUser";
import { describe, test, expect, vi } from "vitest";

vi.mock("aws-amplify/auth");

describe("useCheckForUser", () => {
  test("should set isLoggedIn to true when getCurrentUser resolves", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      username: "test",
      userId: "123",
    });

    const { result } = renderHook(() => useCheckForUser());

    act(() => {
      result.current.checkUser();
    });

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));
  });

  test("should set isLoggedIn to false when getCurrentUser rejects", async () => {
    vi.mocked(getCurrentUser).mockRejectedValueOnce(new Error("Error"));

    const { result } = renderHook(() => useCheckForUser());

    act(() => {
      result.current.checkUser();
    });

    await waitFor(() => expect(result.current.isLoggedIn).toBe(false));
  });
});
