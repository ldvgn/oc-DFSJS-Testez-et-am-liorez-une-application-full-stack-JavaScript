import { renderHook, waitFor } from "@testing-library/react";
import axios, { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTeachers } from "./useTeachers";
import { teacherService } from "../services/teacher.service";
import { logger } from "../utils/logger";
import type { Teacher } from "../types";

vi.mock("../services/teacher.service", () => ({
  teacherService: {
    getAll: vi.fn(),
  },
}));

vi.mock("../utils/logger", () => ({
  logger: { error: vi.fn() },
}));

const mockedTeacherService = vi.mocked(teacherService);
const mockedLogger = vi.mocked(logger);

function makeTeacher(overrides: Partial<Teacher> = {}): Teacher {
  return { id: 1, firstName: "John", lastName: "Doe", ...overrides };
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

describe("useTeachers", () => {
  it("fetches the teacher list on mount", async () => {
    const teachers = [makeTeacher({ id: 1 }), makeTeacher({ id: 2 })];
    mockedTeacherService.getAll.mockResolvedValueOnce(mockResponse(teachers));

    const { result } = renderHook(() => useTeachers());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.teachers).toEqual(teachers);
    expect(result.current.error).toBeNull();
    expect(mockedTeacherService.getAll).toHaveBeenCalledWith(
      expect.any(AbortSignal),
    );
  });

  it("sets an error and logs it when the fetch fails", async () => {
    mockedTeacherService.getAll.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useTeachers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load teachers");
    expect(result.current.teachers).toEqual([]);
    expect(mockedLogger.error).toHaveBeenCalledWith(
      "Failed to load teachers",
      expect.any(Error),
    );
  });

  it("does not surface a cancelled request as an error", async () => {
    mockedTeacherService.getAll.mockRejectedValueOnce(new axios.CanceledError());

    const { result } = renderHook(() => useTeachers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedLogger.error).not.toHaveBeenCalled();
  });

  it("aborts the in-flight request when the component unmounts", () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const deferred = createDeferred<AxiosResponse<Teacher[]>>();
    mockedTeacherService.getAll.mockReturnValueOnce(deferred.promise);

    const { unmount } = renderHook(() => useTeachers());

    unmount();

    expect(abortSpy).toHaveBeenCalledTimes(1);

    deferred.resolve(mockResponse([]));
    abortSpy.mockRestore();
  });
});
