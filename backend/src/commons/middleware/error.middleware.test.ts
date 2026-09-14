import { describe, it, expect, vi, afterEach } from "vitest";
import type { Request, Response } from "express";
import { z } from "zod";
import { errorHandler } from "./error.middleware";
import { BadRequestError } from "../errors/http-error";

const buildRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("errorHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("responds with the HttpError status and message", () => {
    const res = buildRes();

    errorHandler(new BadRequestError("Invalid payload"), {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid payload" });
  });

  it("responds with 400 and a treeified body for ZodError", () => {
    const res = buildRes();
    const schema = z.object({ name: z.string() });
    const zodError = schema.safeParse({ name: 42 }).error!;

    errorHandler(zodError, {} as Request, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: expect.any(Object) });
  });

  it("responds with 500 and logs unexpected errors", () => {
    const res = buildRes();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const req = { method: "GET", originalUrl: "/api/boom" } as Request;
    const error = new Error("Something exploded");

    errorHandler(error, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
    expect(console.error).toHaveBeenCalled();
  });
});
