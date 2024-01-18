import { describe, test, expect, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import HomeLayout from "./HomeLayout";
import { AuthContextProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";

vi.mock("aws-amplify/auth");

const renderComponent = () => {
  render(
    <MemoryRouter>
      <AuthContextProvider>
        <HomeLayout />
      </AuthContextProvider>
    </MemoryRouter>
  );
};

describe("HomeLayout", () => {
  test("renders the Banner component", () => {
    renderComponent();
    const bannerElement = screen.getByRole("navigation");
    expect(bannerElement).toBeInTheDocument();
  });

  test("renders the main element", () => {
    renderComponent();
    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();
  });
});
