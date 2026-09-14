import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { SessionService } from "./session.service";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../commons/errors/http-error";
import prisma from "../../commons/prisma/client";

vi.mock("../../commons/prisma/client", () => ({
  default: {
    session: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sessionParticipation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    teacher: {
      findUnique: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  session: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  sessionParticipation: { findUnique: Mock; create: Mock; delete: Mock };
  user: { findUnique: Mock };
  teacher: { findUnique: Mock };
};

const mockSession = {
  id: 1,
  name: "Yoga Vinyasa",
  date: new Date("2026-02-15"),
  description: "A great session",
  teacherId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  teacher: {
    id: 1,
    firstName: "Margot",
    lastName: "Delahaye",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  participants: [
    {
      sessionId: 1,
      userId: 1,
      user: {
        id: 1,
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        admin: false,
        password: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ],
};

const adminUser = {
  id: 1,
  email: "admin@test.com",
  firstName: "Admin",
  lastName: "User",
  admin: true,
  password: "hashed",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const regularUser = {
  id: 2,
  email: "user@test.com",
  firstName: "Regular",
  lastName: "User",
  admin: false,
  password: "hashed",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("SessionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns all sessions", async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession]);

      const sessionService = new SessionService();
      const result = await sessionService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Yoga Vinyasa");
    });
  });

  describe("getById", () => {
    it("returns the session when it exists", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);

      const sessionService = new SessionService();
      const result = await sessionService.getById(1);

      expect(result.name).toBe("Yoga Vinyasa");
    });

    it("throws NotFoundError when the session does not exist", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const sessionService = new SessionService();

      await expect(sessionService.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("create", () => {
    it("creates the session when the caller is admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(adminUser);
      mockPrisma.teacher.findUnique.mockResolvedValue(mockSession.teacher);
      mockPrisma.session.create.mockResolvedValue(mockSession);

      const sessionService = new SessionService();
      const result = await sessionService.create(1, {
        name: "New Session",
        date: "2026-03-01",
        description: "Description",
        teacherId: 1,
      });

      expect(result.name).toBe("Yoga Vinyasa");
    });

    it("throws ForbiddenError when the caller is not admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(regularUser);

      const sessionService = new SessionService();

      await expect(
        sessionService.create(2, {
          name: "New Session",
          date: "2026-03-01",
          description: "Description",
          teacherId: 1,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws NotFoundError when the teacher does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(adminUser);
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      const sessionService = new SessionService();

      await expect(
        sessionService.create(1, {
          name: "New Session",
          date: "2026-03-01",
          description: "Description",
          teacherId: 999,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("update", () => {
    it("updates the session when the caller is admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(adminUser);
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.session.update.mockResolvedValue({
        ...mockSession,
        name: "Updated",
      });

      const sessionService = new SessionService();
      const result = await sessionService.update(1, 1, { name: "Updated" });

      expect(result.name).toBe("Updated");
    });
  });

  describe("delete", () => {
    it("deletes the session when the caller is admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(adminUser);
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.session.delete.mockResolvedValue(mockSession);

      const sessionService = new SessionService();

      await expect(sessionService.delete(1, 1)).resolves.toBeUndefined();
    });
  });

  describe("participate", () => {
    it("registers the user as a participant", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(regularUser);
      mockPrisma.sessionParticipation.findUnique.mockResolvedValue(null);
      mockPrisma.sessionParticipation.create.mockResolvedValue({
        sessionId: 1,
        userId: 2,
      });

      const sessionService = new SessionService();

      await expect(sessionService.participate(2, 1)).resolves.toBeUndefined();
    });

    it("throws BadRequestError when already participating", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(regularUser);
      mockPrisma.sessionParticipation.findUnique.mockResolvedValue({
        sessionId: 1,
        userId: 2,
      });

      const sessionService = new SessionService();

      await expect(sessionService.participate(2, 1)).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe("unparticipate", () => {
    it("removes the user from the participants", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.sessionParticipation.findUnique.mockResolvedValue({
        sessionId: 1,
        userId: 2,
      });
      mockPrisma.sessionParticipation.delete.mockResolvedValue({
        sessionId: 1,
        userId: 2,
      });

      const sessionService = new SessionService();

      await expect(sessionService.unparticipate(2, 1)).resolves.toBeUndefined();
    });

    it("throws NotFoundError when the participation does not exist", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.sessionParticipation.findUnique.mockResolvedValue(null);

      const sessionService = new SessionService();

      await expect(sessionService.unparticipate(2, 1)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
