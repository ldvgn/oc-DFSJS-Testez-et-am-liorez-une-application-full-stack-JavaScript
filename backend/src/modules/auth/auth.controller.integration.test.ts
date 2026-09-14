import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import request from "supertest";
import * as bcrypt from "bcrypt";
import app from "../../app";
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

describe("Auth controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("creates the user and returns it with a token", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: "new@test.com",
        firstName: "Jane",
        lastName: "Doe",
        admin: false,
        password: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).post("/api/auth/register").send({
        email: "new@test.com",
        firstName: "Jane",
        lastName: "Doe",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.email).toBe("new@test.com");
    });

    it("returns 400 when the email is already registered", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "existing@example.com",
        firstName: "Existing",
        lastName: "Teacher",
        admin: false,
        password: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).post("/api/auth/register").send({
        email: "existing@example.com",
        firstName: "New",
        lastName: "Teacher",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email already exists");
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns the user with a token on valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "margot.delahaye@example.com",
        firstName: "Margot",
        lastName: "Delahaye",
        admin: false,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "margot.delahaye@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("returns 401 when invalid credentials", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({
        email: "unknown@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("returns 400 when the payload fails validation", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "margot.delahaye@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
