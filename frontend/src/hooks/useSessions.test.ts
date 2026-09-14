import { act, renderHook, waitFor } from "@testing-library/react";
import axios, { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSessions } from "./useSessions";
import { sessionService } from "../services/session.service";
import { logger } from "../utils/logger";
import type { Session } from "../types";

vi.mock("../services/session.service", () => ({
  sessionService: {
    getAll: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../utils/logger", () => ({
  logger: { error: vi.fn() },
}));

const mockedSessionService = vi.mocked(sessionService);
const mockedLogger = vi.mocked(logger);

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 1,
    name: "Morning Flow",
    date: "2026-01-05T09:00:00.000Z",
    description: "A gentle morning session",
    teacher: { id: 1, firstName: "John", lastName: "Doe" },
    participants: [],
    ...overrides,
  };
}

/**
 * Builds a minimal AxiosResponse: only `data` matters to the hook under
 * test, the other required fields are irrelevant filler.
 */
function mockResponse<T>(data: T): AxiosResponse<T> {
  return { data } as AxiosResponse<T>;
}

/**
 * A promise whose resolution is controlled from the test, used to keep a
 * fetch "in flight" while asserting on intermediate hook state.
 */
function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSessions", () => {
  it("fetches the session list on mount", async () => {
    const sessions = [makeSession({ id: 1 }), makeSession({ id: 2 })];
    mockedSessionService.getAll.mockResolvedValueOnce(mockResponse(sessions));

    const { result } = renderHook(() => useSessions());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.sessions).toEqual(sessions);
    expect(result.current.error).toBeNull();
    expect(mockedSessionService.getAll).toHaveBeenCalledWith(
      expect.any(AbortSignal),
    );
  });

  it("sets an error and logs it when the fetch fails", async () => {
    mockedSessionService.getAll.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useSessions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load sessions");
    expect(result.current.sessions).toEqual([]);
    expect(mockedLogger.error).toHaveBeenCalledWith(
      "Failed to load sessions",
      expect.any(Error),
    );
  });

  it("does not surface a cancelled request as an error", async () => {
    mockedSessionService.getAll.mockRejectedValueOnce(new axios.CanceledError());

    const { result } = renderHook(() => useSessions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedLogger.error).not.toHaveBeenCalled();
  });

  it("deletes a session then reloads the list", async () => {
    const initial = [makeSession({ id: 1 }), makeSession({ id: 2 })];
    const afterDelete = [makeSession({ id: 2 })];
    mockedSessionService.getAll.mockResolvedValueOnce(mockResponse(initial));
    mockedSessionService.delete.mockResolvedValueOnce(mockResponse(undefined));
    mockedSessionService.getAll.mockResolvedValueOnce(mockResponse(afterDelete));

    const { result } = renderHook(() => useSessions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteSession(1);
    });

    expect(mockedSessionService.delete).toHaveBeenCalledWith(1);
    expect(mockedSessionService.getAll).toHaveBeenCalledTimes(2);
    expect(result.current.sessions).toEqual(afterDelete);
  });

  it("aborts the in-flight request when the component unmounts", () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const deferred = createDeferred<AxiosResponse<Session[]>>();
    mockedSessionService.getAll.mockReturnValueOnce(deferred.promise);

    const { unmount } = renderHook(() => useSessions());

    unmount();

    expect(abortSpy).toHaveBeenCalledTimes(1);

    deferred.resolve(mockResponse([]));
    abortSpy.mockRestore();
  });
});
