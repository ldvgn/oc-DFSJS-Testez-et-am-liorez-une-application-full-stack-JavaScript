import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { UserRepository } from "../user/user.repository";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../commons/errors/http-error";
import prisma from "../../commons/prisma/client";

vi.mock("../../commons/prisma/client", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  user: { findUnique: Mock; create: Mock };
};

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("returns the auth response when the credentials are correct", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        admin: false,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const authService = new AuthService();

      const result = await authService.login({
        email: "test@test.com",
        password: "password123",
      });

      expect(result.id).toBe(1);
      expect(result.email).toBe("test@test.com");
      expect(result.token).toBeDefined();
    });

    it("throws UnauthorizedError when the password does not match", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        admin: false,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const authService = new AuthService();

      await expect(
        authService.login({
          email: "test@test.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws UnauthorizedError when no user matches the email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const authService = new AuthService();

      await expect(
        authService.login({
          email: "unknown@test.com",
          password: "password123",
        }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("register", () => {
    it("creates a new user and returns auth response", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 2,
        email: "new@test.com",
        firstName: "Jane",
        lastName: "Doe",
        admin: false,
        password: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const authService = new AuthService();

      const result = await authService.register({
        email: "new@test.com",
        firstName: "Jane",
        lastName: "Doe",
        password: "password123",
      });

      expect(result.id).toBe(2);
      expect(result.email).toBe("new@test.com");
      expect(result.token).toBeDefined();
    });

    it("throws BadRequestError when the email is already registered", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        admin: false,
        password: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const authService = new AuthService();

      await expect(
        authService.register({
          email: "test@test.com",
          firstName: "John",
          lastName: "Doe",
          password: "password123",
        }),
      ).rejects.toThrow(BadRequestError);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });
});
