import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { AxiosResponse } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SessionDetail from "./SessionDetail";
import { authService } from "../services/auth.service";
import { sessionService } from "../services/session.service";
import { logger } from "../utils/logger";
import { notify } from "../utils/notify";
import type { AuthResponse, Session } from "../types";

vi.mock("../services/auth.service", () => ({
  authService: { getCurrentUser: vi.fn() },
}));

vi.mock("../services/session.service", () => ({
  sessionService: {
    getById: vi.fn(),
    participate: vi.fn(),
    unparticipate: vi.fn(),
    delete: vi.fn(),
  },
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
    id: 7,
    name: "Morning Flow",
    date: "2026-01-05T09:00:00.000Z",
    description: "A gentle morning session",
    teacher: { id: 1, firstName: "John", lastName: "Doe" },
    users: [],
    ...overrides,
  };
}

function renderSessionDetail(path = "/sessions/7") {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/sessions" element={<div>Sessions List</div>} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SessionDetail", () => {
  it("shows a loading state while the session is being fetched", () => {
    mockedAuthService.getCurrentUser.mockReturnValue(makeUser());
    mockedSessionService.getById.mockReturnValue(new Promise(() => {}));

    renderSessionDetail();

    expect(screen.getByText("Loading session...")).toBeInTheDocument();
  });

  it("shows an error message when the session fails to load", async () => {
    mockedAuthService.getCurrentUser.mockReturnValue(makeUser());
    mockedSessionService.getById.mockRejectedValueOnce(
      new Error("network down"),
    );

    renderSessionDetail();

    expect(
      await screen.findByText("Failed to load session details"),
    ).toBeInTheDocument();
  });

  it('shows "Session not found" when the URL id is not a number', () => {
    mockedAuthService.getCurrentUser.mockReturnValue(makeUser());

    renderSessionDetail("/sessions/not-a-number");

    expect(screen.getByText("Session not found")).toBeInTheDocument();
    expect(mockedSessionService.getById).not.toHaveBeenCalled();
  });

  it("shows Join Session for a non-admin, and switches to Leave Session once joined", async () => {
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ id: 42, admin: false }),
    );
    mockedSessionService.getById
      .mockResolvedValueOnce(mockResponse(makeSession({ users: [] })))
      .mockResolvedValueOnce(mockResponse(makeSession({ users: [42] })));
    mockedSessionService.participate.mockResolvedValueOnce(
      mockResponse(undefined),
    );

    renderSessionDetail();

    expect(await screen.findByText("Join Session")).toBeInTheDocument();
    expect(screen.queryByText("Leave Session")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Join Session"));

    await waitFor(() =>
      expect(mockedSessionService.participate).toHaveBeenCalledWith(7, 42),
    );
    expect(await screen.findByText("Leave Session")).toBeInTheDocument();
  });

  it("shows Leave Session for a joined non-admin, and switches back to Join Session once left", async () => {
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ id: 42, admin: false }),
    );
    mockedSessionService.getById
      .mockResolvedValueOnce(mockResponse(makeSession({ users: [42] })))
      .mockResolvedValueOnce(mockResponse(makeSession({ users: [] })));
    mockedSessionService.unparticipate.mockResolvedValueOnce(
      mockResponse(undefined),
    );

    renderSessionDetail();

    expect(await screen.findByText("Leave Session")).toBeInTheDocument();
    expect(screen.queryByText("Join Session")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Leave Session"));

    await waitFor(() =>
      expect(mockedSessionService.unparticipate).toHaveBeenCalledWith(7, 42),
    );
    expect(await screen.findByText("Join Session")).toBeInTheDocument();
  });

  it("notifies and logs when joining the session fails", async () => {
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ id: 42, admin: false }),
    );
    mockedSessionService.getById.mockResolvedValueOnce(
      mockResponse(makeSession({ users: [] })),
    );
    mockedSessionService.participate.mockRejectedValueOnce(new Error("boom"));

    renderSessionDetail();

    fireEvent.click(await screen.findByText("Join Session"));

    await waitFor(() =>
      expect(mockedNotify.error).toHaveBeenCalledWith("Failed to join session"),
    );
    expect(mockedLogger.error).toHaveBeenCalledWith("msg", expect.any(Error), {
      sessionId: 7,
      user: "Jane Doe (42)",
    });
  });

  it("notifies and logs when leaving the session fails", async () => {
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ id: 42, admin: false }),
    );
    mockedSessionService.getById.mockResolvedValueOnce(
      mockResponse(makeSession({ users: [42] })),
    );
    mockedSessionService.unparticipate.mockRejectedValueOnce(new Error("boom"));

    renderSessionDetail();

    fireEvent.click(await screen.findByText("Leave Session"));

    await waitFor(() =>
      expect(mockedNotify.error).toHaveBeenCalledWith(
        "Failed to leave session",
      ),
    );
    expect(mockedLogger.error).toHaveBeenCalledWith("msg", expect.any(Error), {
      sessionId: 7,
      user: "Jane Doe (42)",
    });
  });

  it("asks for confirmation before deleting, then deletes and redirects once confirmed", async () => {
    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    mockedAuthService.getCurrentUser.mockReturnValue(makeUser({ admin: true }));
    mockedSessionService.getById.mockResolvedValueOnce(
      mockResponse(makeSession()),
    );
    mockedSessionService.delete.mockResolvedValueOnce(mockResponse(undefined));

    renderSessionDetail();

    expect(await screen.findByText("Edit")).toHaveAttribute(
      "href",
      "/sessions/edit/7",
    );
    expect(screen.queryByText("Join Session")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(mockedSessionService.delete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(mockedSessionService.delete).toHaveBeenCalledWith(7),
    );
    expect(await screen.findByText("Sessions List")).toBeInTheDocument();
  });

  it("notifies and logs when deleting the session fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedAuthService.getCurrentUser.mockReturnValue(makeUser({ admin: true }));
    mockedSessionService.getById.mockResolvedValueOnce(
      mockResponse(makeSession()),
    );
    mockedSessionService.delete.mockRejectedValueOnce(new Error("boom"));

    renderSessionDetail();

    fireEvent.click(await screen.findByText("Delete"));

    await waitFor(() =>
      expect(mockedNotify.error).toHaveBeenCalledWith(
        "Failed to delete session",
      ),
    );
    expect(mockedLogger.error).toHaveBeenCalledWith(
      "Failed to delete session",
      expect.any(Error),
      { sessionId: 7, user: "Jane Doe (1)" },
    );
  });
});
