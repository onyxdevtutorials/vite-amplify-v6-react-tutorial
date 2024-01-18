import { vi } from "vitest";
import {
  fireEvent,
  screen,
  waitFor,
  within,
  render as rtlRender,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProvider } from "../context/AuthContext";

const useCheckForUserMock = vi.hoisted(() => {
  return {
    isLoggedIn: false,
    user: null,
    checkUser: vi.fn(),
  };
});

vi.mock("../hooks/useCheckForUser", async () => {
  const actual = await vi.importActual<
    typeof import("../hooks/useCheckForUser")
  >("../hooks/useCheckForUser");
  return {
    ...actual,
    useCheckForUser: useCheckForUserMock,
  };
});

function customRender(
  ui: React.ReactElement,
  { route = "/", ...renderOptions } = {}
) {
  window.history.pushState({}, "Test page", route);

  const wrapper: React.FC = ({ children }: { children?: React.ReactNode }) => (
    <MemoryRouter>
      <AuthContextProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AuthContextProvider>
    </MemoryRouter>
  );

  return rtlRender(ui, { wrapper, ...renderOptions });
}

export { fireEvent, screen, waitFor, within, customRender as render };
