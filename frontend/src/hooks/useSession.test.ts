import { act, renderHook, waitFor } from "@testing-library/react";
import axios, { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "./useSession";
import { sessionService } from "../services/session.service";
import { logger } from "../utils/logger";
import type { Session } from "../types";

vi.mock("../services/session.service", () => ({
  sessionService: {
    getById: vi.fn(),
    participate: vi.fn(),
    unparticipate: vi.fn(),
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
    users: [],
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

describe("useSession", () => {
  it("does not fetch and stops loading when the id is invalid", () => {
    const { result } = renderHook(() => useSession(NaN));

    expect(result.current.loading).toBe(false);
    expect(result.current.session).toBeNull();
    expect(mockedSessionService.getById).not.toHaveBeenCalled();
  });

  it("fetches the session on mount", async () => {
    const session = makeSession();
    mockedSessionService.getById.mockResolvedValueOnce(mockResponse(session));

    const { result } = renderHook(() => useSession(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.session).toEqual(session);
    expect(result.current.error).toBeNull();
    expect(mockedSessionService.getById).toHaveBeenCalledWith(
      1,
      expect.any(AbortSignal),
    );
  });

  it("sets an error and logs it when the fetch fails", async () => {
    mockedSessionService.getById.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useSession(1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load session details");
    // Matches the log message currently hard-coded in the hook (copy-pasted
    // from useTeachers); asserting the real string so this test doesn't
    // silently mask that mismatch.
    expect(mockedLogger.error).toHaveBeenCalledWith(
      "Failed to load teachers",
      expect.any(Error),
    );
  });

  it("does not surface a cancelled request as an error", async () => {
    mockedSessionService.getById.mockRejectedValueOnce(new axios.CanceledError());

    const { result } = renderHook(() => useSession(1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedLogger.error).not.toHaveBeenCalled();
  });

  it("refetches when the id changes and cancels the previous request", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const session1 = makeSession({ id: 1 });
    const session2 = makeSession({ id: 2 });
    mockedSessionService.getById.mockResolvedValueOnce(mockResponse(session1));
    mockedSessionService.getById.mockResolvedValueOnce(mockResponse(session2));

    const { result, rerender } = renderHook(({ id }) => useSession(id), {
      initialProps: { id: 1 },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toEqual(session1);

    rerender({ id: 2 });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.session).toEqual(session2);
    expect(mockedSessionService.getById).toHaveBeenNthCalledWith(
      1,
      1,
      expect.any(AbortSignal),
    );
    expect(mockedSessionService.getById).toHaveBeenNthCalledWith(
      2,
      2,
      expect.any(AbortSignal),
    );
    expect(abortSpy).toHaveBeenCalled();

    abortSpy.mockRestore();
  });

  it("registers the user then refetches the session", async () => {
    const initial = makeSession({ id: 1, users: [] });
    const updated = makeSession({ id: 1, users: [42] });
    mockedSessionService.getById.mockResolvedValueOnce(mockResponse(initial));
    mockedSessionService.participate.mockResolvedValueOnce(
      mockResponse(undefined),
    );
    mockedSessionService.getById.mockResolvedValueOnce(mockResponse(updated));

    const { result } = renderHook(() => useSession(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.participate(42);
    });

    expect(mockedSessionService.participate).toHaveBeenCalledWith(1, 42);
    expect(mockedSessionService.getById).toHaveBeenCalledTimes(2);
    expect(result.current.session).toEqual(updated);
  });

  it("unregisters the user then refetches the session", async () => {
    const initial = makeSession({ id: 1, users: [42] });
    const updated = makeSession({ id: 1, users: [] });
    mockedSessionService.getById.mockResolvedValueOnce(mockResponse(initial));
    mockedSessionService.unparticipate.mockResolvedValueOnce(
      mockResponse(undefined),
    );
    mockedSessionService.getById.mockResolvedValueOnce(mockResponse(updated));

    const { result } = renderHook(() => useSession(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.unparticipate(42);
    });

    expect(mockedSessionService.unparticipate).toHaveBeenCalledWith(1, 42);
    expect(mockedSessionService.getById).toHaveBeenCalledTimes(2);
    expect(result.current.session).toEqual(updated);
  });

  it("deletes the session without refetching it", async () => {
    const session = makeSession({ id: 1 });
    mockedSessionService.getById.mockResolvedValueOnce(mockResponse(session));
    mockedSessionService.delete.mockResolvedValueOnce(mockResponse(undefined));

    const { result } = renderHook(() => useSession(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteSession();
    });

    expect(mockedSessionService.delete).toHaveBeenCalledWith(1);
    expect(mockedSessionService.getById).toHaveBeenCalledTimes(1);
  });

  it("aborts the in-flight request when the component unmounts", () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const deferred = createDeferred<AxiosResponse<Session>>();
    mockedSessionService.getById.mockReturnValueOnce(deferred.promise);

    const { unmount } = renderHook(() => useSession(1));

    unmount();

    expect(abortSpy).toHaveBeenCalledTimes(1);

    deferred.resolve(mockResponse(makeSession()));
    abortSpy.mockRestore();
  });
});
