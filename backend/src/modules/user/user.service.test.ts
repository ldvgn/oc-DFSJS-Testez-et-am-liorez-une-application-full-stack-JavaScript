import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { User } from "@prisma/client";
import { UserService } from "./user.service";
import { ForbiddenError, NotFoundError } from "../../commons/errors/http-error";
import prisma from "../../commons/prisma/client";

vi.mock("../../commons/prisma/client", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  user: { findUnique: Mock; delete: Mock; update: Mock };
};

const mockUser: User = {
  id: 1,
  email: "margot.delahaye@example.com",
  firstName: "Margot",
  lastName: "Delahaye",
  password: "hashed-password",
  admin: false,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-02T00:00:00.000Z"),
};

describe("UserService", () => {
  const userService = new UserService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("returns the formatted user when it exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getById(mockUser.id);

      expect(result.firstName).toBe("Margot");
      expect(result.lastName).toBe("Delahaye");
    });

    it("throws NotFoundError when no user matches the id", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("remove", () => {
    it("deletes the user when it exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      await userService.remove(mockUser.id);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it("throws NotFoundError and does not delete when the user is missing", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.remove(7)).rejects.toThrow(NotFoundError);
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });
  });

  describe("getAdminOrThrow", () => {
    it("returns the user when it is an admin", async () => {
      const admin = { ...mockUser, admin: true };
      mockPrisma.user.findUnique.mockResolvedValue(admin);

      const result = await userService.getAdminOrThrow(admin.id);

      expect(result).toEqual(admin);
    });

    it("throws ForbiddenError when the user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getAdminOrThrow(1)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it("throws ForbiddenError when the user is not an admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(userService.getAdminOrThrow(1)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe("getUserOrThrow", () => {
    it("returns the raw user entity when it exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getUserOrThrow(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it("throws NotFoundError when no user matches the id", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getUserOrThrow(1)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
