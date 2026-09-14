import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { userService } from "./user.service";
import type { User } from "../types";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const user: User = {
  id: 1,
  email: "user@test.com",
  firstName: "Jane",
  lastName: "Doe",
  admin: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("userService.getById", () => {
  it("gets /user/:id with the abort signal", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: user });
    const controller = new AbortController();

    const result = await userService.getById(1, controller.signal);

    expect(mockedApi.get).toHaveBeenCalledWith("/user/1", {
      signal: controller.signal,
    });
    expect(result.data).toEqual(user);
  });

  it("works without an abort signal", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: user });

    await userService.getById(1);

    expect(mockedApi.get).toHaveBeenCalledWith("/user/1", {
      signal: undefined,
    });
  });
});

describe("userService.delete", () => {
  it("deletes /user/:id", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await userService.delete(1);

    expect(mockedApi.delete).toHaveBeenCalledWith("/user/1");
  });
});

describe("userService.promoteToAdmin", () => {
  it("posts /user/promote-admin and returns the updated user", async () => {
    const promoted = { ...user, admin: true };
    mockedApi.post.mockResolvedValueOnce({ data: promoted });

    const result = await userService.promoteToAdmin();

    expect(mockedApi.post).toHaveBeenCalledWith("/user/promote-admin");
    expect(result.data).toEqual(promoted);
  });
});
