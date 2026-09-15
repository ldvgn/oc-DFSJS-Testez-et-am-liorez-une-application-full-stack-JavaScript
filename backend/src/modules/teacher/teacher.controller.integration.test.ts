import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import request from "supertest";
import app from "../../app";
import prisma from "../../commons/prisma/client";
import { generateToken } from "../../commons/utils/jwt.util";

vi.mock("../../commons/prisma/client", () => ({
  default: {
    teacher: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  teacher: { findMany: Mock; findUnique: Mock };
};

const token = generateToken(1);

const mockTeacher = {
  id: 1,
  firstName: "Margot",
  lastName: "Delahaye",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Teacher controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/teacher", () => {
    it("returns teachers when authenticated", async () => {
      mockPrisma.teacher.findMany.mockResolvedValue([mockTeacher]);

      const response = await request(app)
        .get("/api/teacher")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it("returns 401 when not authenticated", async () => {
      const response = await request(app).get("/api/teacher");

      expect(response.status).toBe(401);
      expect(mockPrisma.teacher.findMany).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/teacher/:id", () => {
    it("returns the teacher when it exists", async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(mockTeacher);

      const response = await request(app)
        .get("/api/teacher/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("returns 401 when not authenticated", async () => {
      const response = await request(app).get("/api/teacher/1");

      expect(response.status).toBe(401);
    });

    it("returns 400 when the id is not a valid number", async () => {
      const response = await request(app)
        .get("/api/teacher/not-a-number")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(mockPrisma.teacher.findUnique).not.toHaveBeenCalled();
    });

    it("returns 404 when teacher not found", async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/teacher/999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
