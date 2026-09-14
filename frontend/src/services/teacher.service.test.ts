import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { teacherService } from "./teacher.service";
import type { Teacher } from "../types";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const teachers: Teacher[] = [
  { id: 1, firstName: "John", lastName: "Doe" },
  { id: 2, firstName: "Jane", lastName: "Smith" },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("teacherService.getAll", () => {
  it("gets /teacher with the abort signal", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: teachers });
    const controller = new AbortController();

    const result = await teacherService.getAll(controller.signal);

    expect(mockedApi.get).toHaveBeenCalledWith("/teacher", {
      signal: controller.signal,
    });
    expect(result.data).toEqual(teachers);
  });

  it("works without an abort signal", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: teachers });

    await teacherService.getAll();

    expect(mockedApi.get).toHaveBeenCalledWith("/teacher", {
      signal: undefined,
    });
  });
});
