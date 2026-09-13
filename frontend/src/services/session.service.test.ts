import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { sessionService } from "./session.service";
import type { Session, SessionFormData } from "../types";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const session: Session = {
  id: 1,
  name: "Morning Flow",
  date: "2026-01-05T09:00:00.000Z",
  description: "A gentle morning session",
  teacher: { id: 1, firstName: "John", lastName: "Doe" },
  participants: [],
};

const formData: SessionFormData = {
  name: "Morning Flow",
  date: "2026-01-05T09:00:00.000Z",
  description: "A gentle morning session",
  teacherId: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sessionService.getAll", () => {
  it("gets /session with the abort signal", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [session] });
    const controller = new AbortController();

    const result = await sessionService.getAll(controller.signal);

    expect(mockedApi.get).toHaveBeenCalledWith("/session", {
      signal: controller.signal,
    });
    expect(result.data).toEqual([session]);
  });

  it("works without an abort signal", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [session] });

    await sessionService.getAll();

    expect(mockedApi.get).toHaveBeenCalledWith("/session", {
      signal: undefined,
    });
  });
});

describe("sessionService.getById", () => {
  it("gets /session/:id with the abort signal", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: session });
    const controller = new AbortController();

    const result = await sessionService.getById(1, controller.signal);

    expect(mockedApi.get).toHaveBeenCalledWith("/session/1", {
      signal: controller.signal,
    });
    expect(result.data).toEqual(session);
  });
});

describe("sessionService.delete", () => {
  it("deletes /session/:id", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await sessionService.delete(1);

    expect(mockedApi.delete).toHaveBeenCalledWith("/session/1");
  });
});

describe("sessionService.participate", () => {
  it("posts /session/:id/participate/:userId", async () => {
    mockedApi.post.mockResolvedValueOnce({});

    await sessionService.participate(1, 42);

    expect(mockedApi.post).toHaveBeenCalledWith("/session/1/participate/42");
  });
});

describe("sessionService.unparticipate", () => {
  it("deletes /session/:id/participate/:userId", async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    await sessionService.unparticipate(1, 42);

    expect(mockedApi.delete).toHaveBeenCalledWith(
      "/session/1/participate/42",
    );
  });
});

describe("sessionService.create", () => {
  it("posts the form data to /session", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: session });

    const result = await sessionService.create(formData);

    expect(mockedApi.post).toHaveBeenCalledWith("/session", formData);
    expect(result.data).toEqual(session);
  });
});

describe("sessionService.update", () => {
  it("puts the form data to /session/:id", async () => {
    mockedApi.put.mockResolvedValueOnce({ data: session });

    const result = await sessionService.update(1, formData);

    expect(mockedApi.put).toHaveBeenCalledWith("/session/1", formData);
    expect(result.data).toEqual(session);
  });
});
