import { describe, it, expect, vi } from "vitest";
import type { Response } from "express";
import { authMiddleware, AuthRequest } from "./auth.middleware";
import { generateToken } from "../utils/jwt.util";
import { UnauthorizedError } from "../errors/http-error";

const buildReq = (authorization?: string): AuthRequest =>
  ({ headers: { authorization } }) as AuthRequest;

describe("authMiddleware", () => {
  it("throws UnauthorizedError when no authorization header is present", () => {
    const next = vi.fn();

    expect(() =>
      authMiddleware(buildReq(undefined), {} as Response, next),
    ).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("throws UnauthorizedError when the header has no token part", () => {
    const next = vi.fn();

    expect(() =>
      authMiddleware(buildReq("Bearer"), {} as Response, next),
    ).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it("throws UnauthorizedError when the token is invalid or expired", () => {
    const next = vi.fn();

    expect(() =>
      authMiddleware(buildReq("Bearer not-a-real-token"), {} as Response, next),
    ).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });
});
