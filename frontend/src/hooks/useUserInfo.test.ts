import { act, renderHook, waitFor } from "@testing-library/react";
import axios, { type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUserInfo } from "./useUserInfo";
import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";
import { logger } from "../utils/logger";
import type { User } from "../types";

vi.mock("../services/user.service", () => ({
  userService: {
    getById: vi.fn(),
    delete: vi.fn(),
    promoteToAdmin: vi.fn(),
  },
}));

vi.mock("../services/auth.service", () => ({
  authService: {
    updateCurrentUser: vi.fn(),
  },
}));

vi.mock("../utils/logger", () => ({
  logger: { error: vi.fn() },
}));

const mockedUserService = vi.mocked(userService);
const mockedAuthService = vi.mocked(authService);
const mockedLogger = vi.mocked(logger);

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

describe("useUserInfo", () => {
  it("does not fetch and stops loading when the id is invalid", () => {
    const { result } = renderHook(() => useUserInfo(NaN));

    expect(result.current.loading).toBe(false);
    expect(result.current.userInfo).toBeNull();
    expect(mockedUserService.getById).not.toHaveBeenCalled();
  });

  it("fetches the user info on mount", async () => {
    const user = makeUser();
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(user));

    const { result } = renderHook(() => useUserInfo(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.userInfo).toEqual(user);
    expect(result.current.error).toBeNull();
    expect(mockedUserService.getById).toHaveBeenCalledWith(
      1,
      expect.any(AbortSignal),
    );
  });

  it("sets an error and logs it when the fetch fails", async () => {
    mockedUserService.getById.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useUserInfo(1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load user information");
    expect(mockedLogger.error).toHaveBeenCalledWith(
      "Failed to load user information",
      expect.any(Error),
    );
  });

  it("does not surface a cancelled request as an error", async () => {
    mockedUserService.getById.mockRejectedValueOnce(new axios.CanceledError());

    const { result } = renderHook(() => useUserInfo(1));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedLogger.error).not.toHaveBeenCalled();
  });

  it("refetches when the id changes and cancels the previous request", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const user1 = makeUser({ id: 1 });
    const user2 = makeUser({ id: 2 });
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(user1));
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(user2));

    const { result, rerender } = renderHook(({ id }) => useUserInfo(id), {
      initialProps: { id: 1 },
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.userInfo).toEqual(user1);

    rerender({ id: 2 });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.userInfo).toEqual(user2);
    expect(mockedUserService.getById).toHaveBeenNthCalledWith(
      1,
      1,
      expect.any(AbortSignal),
    );
    expect(mockedUserService.getById).toHaveBeenNthCalledWith(
      2,
      2,
      expect.any(AbortSignal),
    );
    expect(abortSpy).toHaveBeenCalled();

    abortSpy.mockRestore();
  });

  it("deletes the user without refetching it", async () => {
    const user = makeUser();
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(user));
    mockedUserService.delete.mockResolvedValueOnce(mockResponse(undefined));

    const { result } = renderHook(() => useUserInfo(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteUser();
    });

    expect(mockedUserService.delete).toHaveBeenCalledWith(1);
    expect(mockedUserService.getById).toHaveBeenCalledTimes(1);
  });

  it("promotes the user to admin, updates local state and the stored current user", async () => {
    const user = makeUser({ admin: false });
    const promoted = makeUser({ admin: true });
    mockedUserService.getById.mockResolvedValueOnce(mockResponse(user));
    mockedUserService.promoteToAdmin.mockResolvedValueOnce(
      mockResponse(promoted),
    );

    const { result } = renderHook(() => useUserInfo(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.promoteToAdmin();
    });

    expect(mockedUserService.promoteToAdmin).toHaveBeenCalledWith();
    // promoteToAdmin uses the response directly, it never refetches via getById.
    expect(mockedUserService.getById).toHaveBeenCalledTimes(1);
    expect(result.current.userInfo).toEqual(promoted);
    expect(mockedAuthService.updateCurrentUser).toHaveBeenCalledWith({
      admin: true,
    });
  });

  it("aborts the in-flight request when the component unmounts", () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const deferred = createDeferred<AxiosResponse<User>>();
    mockedUserService.getById.mockReturnValueOnce(deferred.promise);

    const { unmount } = renderHook(() => useUserInfo(1));

    unmount();

    expect(abortSpy).toHaveBeenCalledTimes(1);

    deferred.resolve(mockResponse(makeUser()));
    abortSpy.mockRestore();
  });
});
