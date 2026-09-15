import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { Teacher } from "@prisma/client";
import { TeacherService } from "./teacher.service";
import { NotFoundError } from "../../commons/errors/http-error";
import prisma from "../../commons/prisma/client";

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

const mockTeacher: Teacher = {
  id: 1,
  firstName: "Margot",
  lastName: "Delahaye",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-02T00:00:00.000Z"),
};

describe("TeacherService", () => {
  const teacherService = new TeacherService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("returns all teachers", async () => {
      mockPrisma.teacher.findMany.mockResolvedValue([mockTeacher]);

      const result = await teacherService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe("Margot");
    });

    it("returns an empty array when no teachers exist", async () => {
      mockPrisma.teacher.findMany.mockResolvedValue([]);

      const result = await teacherService.getAll();

      expect(result).toHaveLength(0);
    });
  });

  describe("getById", () => {
    it("returns a teacher by id", async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await teacherService.getById(1);

      expect(result.firstName).toBe("Margot");
      expect(result.lastName).toBe("Delahaye");
    });

    it("throws NotFoundError when the teacher does not exist", async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      await expect(teacherService.getById(999)).rejects.toThrow(NotFoundError);
      await expect(teacherService.getById(999)).rejects.toThrow("Teacher not found");
    });
  });

  describe("getTeacherOrThrow", () => {
    it("returns the raw teacher entity when it exists", async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await teacherService.getTeacherOrThrow(1);

      expect(result).toEqual(mockTeacher);
    });

    it("throws NotFoundError when no teacher matches the id", async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      await expect(teacherService.getTeacherOrThrow(1)).rejects.toThrow(NotFoundError);
    });
  });
});
