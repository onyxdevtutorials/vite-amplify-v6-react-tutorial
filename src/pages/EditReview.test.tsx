import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { updateReview } from "../graphql/mutations";
import EditReview from "./EditReview";
import { getReview } from "../graphql/queries";

vi.mock("react-router-dom", async () => {
  const router = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...router,
    useParams: vi
      .fn()
      .mockReturnValue({ reviewId: "372db325-5f72-49fa-ba8c-ab628c0ed470" }),
  };
});

const { graphqlMock } = vi.hoisted(() => {
  return { graphqlMock: vi.fn() };
});

vi.mock("aws-amplify/api", () => ({
  generateClient: vi.fn(() => ({
    graphql: graphqlMock,
  })),
}));

vi.mock("aws-amplify/auth");

const mockReview = {
  content: "Test Review",
  rating: 5,
  id: "372db325-5f72-49fa-ba8c-ab628c0ed470",
};

const newValues = {
  content: "Test Review Updated",
  rating: 3,
};

describe("EditReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders EditReview page, showing form containing test data", async () => {
    graphqlMock.mockResolvedValueOnce({
      data: {
        getReview: mockReview,
      },
    });

    render(
      <MemoryRouter>
        <EditReview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /content/i })).toHaveValue(
        mockReview.content
      );
      expect(screen.getByRole("spinbutton", { name: /rating/i })).toHaveValue(
        mockReview.rating
      );
    });
  });

  test("displays validation errors when form is submitted with invalid data", async () => {
    const user = userEvent.setup();

    graphqlMock.mockResolvedValueOnce({
      data: {
        getReview: mockReview,
      },
    });

    render(
      <MemoryRouter>
        <EditReview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /content/i })).toHaveValue(
        mockReview.content
      );
      expect(screen.getByRole("spinbutton", { name: /rating/i })).toHaveValue(
        mockReview.rating
      );
    });

    await user.clear(screen.getByRole("textbox", { name: /content/i }));
    await user.clear(screen.getByRole("spinbutton", { name: /rating/i }));

    // Submit the form without filling in any fields
    await user.click(screen.getByRole("button", { name: /update/i }));

    const requiredInputs = screen.getAllByText("Required");
    expect(requiredInputs.length).toBe(2);
  });

  test("updates review when form is submitted with valid data", async () => {
    const user = userEvent.setup();

    graphqlMock
      .mockResolvedValueOnce({
        data: {
          getReview: mockReview,
        },
      })
      .mockResolvedValueOnce({
        data: {
          updateReview: mockReview,
        },
      });

    render(
      <MemoryRouter>
        <EditReview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /content/i })).toHaveValue(
        mockReview.content
      );
      expect(screen.getByRole("spinbutton", { name: /rating/i })).toHaveValue(
        mockReview.rating
      );
    });

    await user.clear(screen.getByRole("textbox", { name: /content/i }));

    // Update the form fields
    await user.type(
      screen.getByRole("textbox", { name: /content/i }),
      newValues.content
    );

    await user.clear(screen.getByRole("spinbutton", { name: /rating/i }));

    await user.type(
      screen.getByRole("spinbutton", { name: /rating/i }),
      newValues.rating.toString()
    );

    await user.click(screen.getByRole("button", { name: /update/i }));

    // Assert that graphql() was called with the updated review data
    await waitFor(() => {
      expect(graphqlMock).toHaveBeenCalledWith({
        query: updateReview,
        variables: {
          input: {
            id: mockReview.id,
            ...newValues,
          },
        },
      });
    });
  });
});
