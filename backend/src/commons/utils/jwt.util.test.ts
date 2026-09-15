import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "./jwt.util";

describe("jwt.util", () => {
  describe("generateToken", () => {
    it("signs a token embedding the user id", () => {
      const token = generateToken(42);

      const decoded = jwt.decode(token) as { userId: number };
      expect(decoded.userId).toBe(42);
    });
  });

  describe("verifyToken", () => {
    it("returns the decoded payload for a valid token", () => {
      const token = generateToken(7);

      const decoded = verifyToken(token) as { userId: number };

      expect(decoded.userId).toBe(7);
    });

    it("returns null for a token signed with another secret", () => {
      const foreignToken = jwt.sign({ userId: 1 }, "another-secret");

      expect(verifyToken(foreignToken)).toBeNull();
    });
  });
});
