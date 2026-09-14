import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";
import { authService } from "../services/auth.service";
import type { AuthResponse } from "../types";

vi.mock("../services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);

function makeUser(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
    id: 1,
    email: "user@test.com",
    firstName: "Jane",
    lastName: "Doe",
    admin: false,
    token: "jwt-token",
    ...overrides,
  };
}

function renderNavbar() {
  return render(
    <MemoryRouter
      initialEntries={["/sessions"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="*" element={<Navbar />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Navbar", () => {
  it("shows Login and Register when logged out", () => {
    mockedAuthService.isAuthenticated.mockReturnValue(false);
    mockedAuthService.getCurrentUser.mockReturnValue(null);

    renderNavbar();

    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sessions" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Logout" }),
    ).not.toBeInTheDocument();
  });

  it("shows Sessions, Profile and Logout, but not Create Session, for a non-admin user", () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ admin: false }),
    );

    renderNavbar();

    expect(screen.getByRole("link", { name: "Sessions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Create Session" }),
    ).not.toBeInTheDocument();
  });

  it("also shows Create Session for an admin user", () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getCurrentUser.mockReturnValue(makeUser({ admin: true }));

    renderNavbar();

    expect(
      screen.getByRole("link", { name: "Create Session" }),
    ).toBeInTheDocument();
  });

  it("logs out and redirects to the login page when Logout is clicked", async () => {
    mockedAuthService.isAuthenticated.mockReturnValue(true);
    mockedAuthService.getCurrentUser.mockReturnValue(makeUser());

    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(mockedAuthService.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
