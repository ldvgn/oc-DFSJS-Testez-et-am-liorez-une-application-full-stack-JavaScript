import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import request from "supertest";
import app from "../../app";
import prisma from "../../commons/prisma/client";
import { generateToken } from "../../commons/utils/jwt.util";

vi.mock("../../commons/prisma/client", () => ({
  default: {
    session: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    teacher: {
      findUnique: vi.fn(),
    },
    sessionParticipation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  session: { findMany: Mock; findUnique: Mock; create: Mock; update: Mock; delete: Mock };
  user: { findUnique: Mock };
  teacher: { findUnique: Mock };
  sessionParticipation: { findUnique: Mock; create: Mock; delete: Mock };
};

const token = generateToken(1);

const adminUser = {
  id: 1,
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  admin: true,
  password: "hashed",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const regularUser = {
  id: 2,
  email: "user@example.com",
  firstName: "Jane",
  lastName: "Doe",
  admin: false,
  password: "hashed",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTeacher = {
  id: 1,
  firstName: "Margot",
  lastName: "Delahaye",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSession = {
  id: 1,
  name: "Yoga Vinyasa",
  date: new Date("2026-02-15"),
  description: "A great session",
  teacherId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  teacher: mockTeacher,
  participants: [],
};

describe("Session controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/session", () => {
    it("returns every session when authenticated", async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession]);

      const response = await request(app)
        .get("/api/session")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it("returns 401 when no token is provided", async () => {
      const response = await request(app).get("/api/session");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/session/:id", () => {
    it("returns the session when it exists", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);

      const response = await request(app)
        .get("/api/session/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Yoga Vinyasa");
    });

    it("returns 404 when no session matches the id", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/session/999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/session", () => {
    it("creates the session when the caller is admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(adminUser);
      mockPrisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockPrisma.session.create.mockResolvedValue(mockSession);

      const response = await request(app)
        .post("/api/session")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "New session",
          date: "2026-03-01",
          description: "A new session",
          teacherId: 1,
        });

      expect(response.status).toBe(201);
    });

    it("returns 400 when the payload fails validation", async () => {
      const response = await request(app)
        .post("/api/session")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "AB" });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/session/:id", () => {
    it("updates the session when the caller is admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(adminUser);
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.session.update.mockResolvedValue({ ...mockSession, name: "Updated" });

      const response = await request(app)
        .put("/api/session/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated session" });

      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/session/:id", () => {
    it("deletes the session when the caller is admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(adminUser);
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.session.delete.mockResolvedValue(mockSession);

      const response = await request(app)
        .delete("/api/session/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/session/:id/participate/:userId", () => {
    it("registers the user for the session", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.user.findUnique.mockResolvedValue(regularUser);
      mockPrisma.sessionParticipation.findUnique.mockResolvedValue(null);
      mockPrisma.sessionParticipation.create.mockResolvedValue({
        sessionId: 1,
        userId: 2,
      });

      const response = await request(app)
        .post("/api/session/1/participate/2")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(mockPrisma.sessionParticipation.create).toHaveBeenCalledWith({
        data: { sessionId: 1, userId: 2 },
      });
    });
  });

  describe("DELETE /api/session/:id/participate/:userId", () => {
    it("removes the user from the session", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession);
      mockPrisma.sessionParticipation.findUnique.mockResolvedValue({
        sessionId: 1,
        userId: 2,
      });
      mockPrisma.sessionParticipation.delete.mockResolvedValue({
        sessionId: 1,
        userId: 2,
      });

      const response = await request(app)
        .delete("/api/session/1/participate/2")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(mockPrisma.sessionParticipation.delete).toHaveBeenCalledWith({
        where: { sessionId_userId: { sessionId: 1, userId: 2 } },
      });
    });
  });
});
