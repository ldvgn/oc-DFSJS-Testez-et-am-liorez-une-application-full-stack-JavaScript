import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AxiosResponse } from "axios";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Sessions from "./Sessions";
import { authService } from "../services/auth.service";
import { sessionService } from "../services/session.service";
import { logger } from "../utils/logger";
import { notify } from "../utils/notify";
import type { AuthResponse, Session } from "../types";

vi.mock("../services/auth.service", () => ({
  authService: { getCurrentUser: vi.fn() },
}));

vi.mock("../services/session.service", () => ({
  sessionService: { getAll: vi.fn(), delete: vi.fn() },
}));

vi.mock("../utils/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("../utils/notify", () => ({ notify: { error: vi.fn() } }));

const mockedAuthService = vi.mocked(authService);
const mockedSessionService = vi.mocked(sessionService);
const mockedLogger = vi.mocked(logger);
const mockedNotify = vi.mocked(notify);

function mockResponse<T>(data: T): AxiosResponse<T> {
  return { data } as AxiosResponse<T>;
}

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

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 1,
    name: "Morning Flow",
    date: "2026-01-05T09:00:00.000Z",
    description: "A gentle morning session",
    teacher: { id: 1, firstName: "John", lastName: "Doe" },
    users: [],
    ...overrides,
  };
}

function renderSessions() {
  return render(
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Sessions />
    </BrowserRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuthService.getCurrentUser.mockReturnValue(makeUser());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Sessions", () => {
  it("shows a loading state while the sessions are being fetched", () => {
    mockedSessionService.getAll.mockReturnValue(new Promise(() => {}));

    renderSessions();

    expect(screen.getByText("Loading sessions...")).toBeInTheDocument();
  });

  it("shows an error message when the sessions fail to load", async () => {
    mockedSessionService.getAll.mockRejectedValueOnce(
      new Error("network down"),
    );

    renderSessions();

    expect(
      await screen.findByText("Failed to load sessions"),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no sessions", async () => {
    mockedSessionService.getAll.mockResolvedValueOnce(mockResponse([]));

    renderSessions();

    expect(
      await screen.findByText("No sessions available"),
    ).toBeInTheDocument();
  });

  it("displays the list of sessions", async () => {
    mockedSessionService.getAll.mockResolvedValueOnce(
      mockResponse([
        makeSession({ id: 1, name: "Morning Flow" }),
        makeSession({ id: 2, name: "Evening Calm" }),
      ]),
    );

    renderSessions();

    expect(await screen.findByText("Morning Flow")).toBeInTheDocument();
    expect(screen.getByText("Evening Calm")).toBeInTheDocument();
  });

  it("does not show Create Session or Delete for a non-admin user", async () => {
    mockedSessionService.getAll.mockResolvedValueOnce(
      mockResponse([makeSession()]),
    );

    renderSessions();

    expect(await screen.findByText("Morning Flow")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Create Session" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("shows Create Session and Delete for an admin user", async () => {
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ admin: true }),
    );
    mockedSessionService.getAll.mockResolvedValueOnce(
      mockResponse([makeSession()]),
    );

    renderSessions();

    expect(
      await screen.findByRole("link", { name: "Create Session" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("does nothing when the delete confirmation is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ admin: true }),
    );
    mockedSessionService.getAll.mockResolvedValueOnce(
      mockResponse([makeSession({ id: 1 })]),
    );

    const user = userEvent.setup();
    renderSessions();

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(mockedSessionService.delete).not.toHaveBeenCalled();
  });

  it("deletes a session after confirmation and reloads the list", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ admin: true }),
    );
    mockedSessionService.getAll
      .mockResolvedValueOnce(mockResponse([makeSession({ id: 1 })]))
      .mockResolvedValueOnce(mockResponse([]));
    mockedSessionService.delete.mockResolvedValueOnce(mockResponse(undefined));

    const user = userEvent.setup();
    renderSessions();

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(mockedSessionService.delete).toHaveBeenCalledWith(1),
    );
    expect(await screen.findByText("No sessions available")).toBeInTheDocument();
  });

  it("notifies and logs when deleting a session fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ admin: true }),
    );
    mockedSessionService.getAll.mockResolvedValueOnce(
      mockResponse([makeSession({ id: 1 })]),
    );
    mockedSessionService.delete.mockRejectedValueOnce(new Error("boom"));

    const user = userEvent.setup();
    renderSessions();

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(mockedNotify.error).toHaveBeenCalledWith(
        "Failed to delete session",
      ),
    );
    expect(mockedLogger.error).toHaveBeenCalledWith(
      "Failed to delete session",
      expect.any(Error),
      { sessionId: 1, user: "Jane Doe (1)" },
    );
    expect(screen.getByText("Morning Flow")).toBeInTheDocument();
  });
});
