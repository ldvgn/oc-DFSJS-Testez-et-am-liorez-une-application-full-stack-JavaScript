import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { AxiosResponse } from "axios";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Profile from "./Profile";
import { authService } from "../services/auth.service";
import { userService } from "../services/user.service";
import type { AuthResponse, User } from "../types";

vi.mock("../services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    updateCurrentUser: vi.fn(),
  },
}));

vi.mock("../services/user.service", () => ({
  userService: { getById: vi.fn(), delete: vi.fn(), promoteToAdmin: vi.fn() },
}));

vi.mock("../utils/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("../utils/notify", () => ({ notify: { error: vi.fn() } }));

const mockedAuthService = vi.mocked(authService);
const mockedUserService = vi.mocked(userService);

function mockResponse<T>(data: T): AxiosResponse<T> {
  return { data } as AxiosResponse<T>;
}

function makeAuthUser(overrides: Partial<AuthResponse> = {}): AuthResponse {
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

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: "user@test.com",
    firstName: "Jane",
    lastName: "Doe",
    admin: false,
    ...overrides,
  };
}

function renderProfile() {
  return render(
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Profile />
    </BrowserRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuthService.getCurrentUser.mockReturnValue(makeAuthUser());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Profile", () => {
  it("shows a loading state while the profile is being fetched", () => {
    mockedUserService.getById.mockReturnValue(new Promise(() => {}));

    renderProfile();

    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("displays the user's information", async () => {
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(makeUser()));

    renderProfile();

    expect(await screen.findByText("Jane")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("user@test.com")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("shows the Administrator badge for an admin user", async () => {
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeAuthUser({ admin: true }),
    );
    mockedUserService.getById.mockResolvedValueOnce(
      mockResponse(makeUser({ admin: true })),
    );

    renderProfile();

    expect(await screen.findByText("Administrator")).toBeInTheDocument();
  });

  it("shows an error message when the profile fails to load", async () => {
    mockedUserService.getById.mockRejectedValueOnce(new Error("network down"));

    renderProfile();

    expect(
      await screen.findByText("Failed to load user information"),
    ).toBeInTheDocument();
  });

  it("promotes the current user to admin", async () => {
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(makeUser()));
    mockedUserService.promoteToAdmin.mockResolvedValueOnce(
      mockResponse(makeUser({ admin: true })),
    );

    renderProfile();

    fireEvent.click(await screen.findByText("Promote to Admin (Dev)"));

    await waitFor(() =>
      expect(mockedAuthService.updateCurrentUser).toHaveBeenCalledWith({
        admin: true,
      }),
    );
    expect(await screen.findByText("Administrator")).toBeInTheDocument();
  });

  it("deletes the account after confirmation, logs out and redirects to login", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(makeUser()));
    mockedUserService.delete.mockResolvedValueOnce(mockResponse(undefined));

    renderProfile();

    fireEvent.click(await screen.findByText("Delete Account"));

    await waitFor(() =>
      expect(mockedUserService.delete).toHaveBeenCalledWith(1),
    );
    expect(mockedAuthService.logout).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the delete confirmation is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(makeUser()));

    renderProfile();

    fireEvent.click(await screen.findByText("Delete Account"));

    expect(mockedUserService.delete).not.toHaveBeenCalled();
    expect(mockedAuthService.logout).not.toHaveBeenCalled();
  });
});
