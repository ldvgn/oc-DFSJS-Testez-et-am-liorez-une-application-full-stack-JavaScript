import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../commons/utils/jwt.util";
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

const mockUser = {
  id: 1,
  email: "user@test.com",
  firstName: "Jean",
  lastName: "Dupont",
  admin: false,
  password: "hashed",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const token = generateToken(mockUser.id);

describe("User controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/user/:id", () => {
    it("returns the user when it exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/user/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("user@test.com");
    });

    it("returns 401 when no token is provided", async () => {
      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(401);
    });

    it("returns 400 when the id is not a valid number", async () => {
      const response = await request(app)
        .get("/api/user/not-a-number")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it("returns 404 when no user matches the id", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/user/999999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/user/:id", () => {
    it("deletes the caller's own account", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      const response = await request(app)
        .delete(`/api/user/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("returns 401 when no token is provided", async () => {
      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(401);
    });

    it("returns 403 when trying to delete another user's account", async () => {
      const response = await request(app)
        .delete("/api/user/2")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it("returns 404 when the account does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/user/${mockUser.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/user/promote-admin", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it("returns 401 when no token is provided", async () => {
      const response = await request(app).post("/api/user/promote-admin");

      expect(response.status).toBe(401);
    });

    it("promotes the caller to admin in development", async () => {
      process.env.NODE_ENV = "development";
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, admin: true });

      const response = await request(app)
        .post("/api/user/promote-admin")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.admin).toBe(true);
    });
  });
});
