import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { authService } from "./auth.service";
import { AuthResponse } from "../types";

vi.mock("./api", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const authResponse: AuthResponse = {
  id: 1,
  email: "user@test.com",
  firstName: "Jane",
  lastName: "Doe",
  admin: false,
  token: "jwt-token",
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("authService.login", () => {
  it("posts the credentials, stores the token and user, and returns the response", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: authResponse });

    const result = await authService.login({
      email: "user@test.com",
      password: "test!1234",
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", {
      email: "user@test.com",
      password: "test!1234",
    });
    expect(result).toEqual(authResponse);
    expect(localStorage.getItem("token")).toBe("jwt-token");
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual(authResponse);
  });

  it("does not touch storage when the response has no token", async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { ...authResponse, token: "" },
    });

    await authService.login({ email: "user@test.com", password: "test!1234" });

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("authService.register", () => {
  it("posts the registration data, stores the token and user, and returns the response", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: authResponse });

    const result = await authService.register({
      email: "user@test.com",
      password: "test!1234",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/register", {
      email: "user@test.com",
      password: "test!1234",
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(result).toEqual(authResponse);
    expect(localStorage.getItem("token")).toBe("jwt-token");
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual(authResponse);
  });

  it("does not touch storage when the response has no token", async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { ...authResponse, token: "" },
    });

    await authService.register({
      email: "user@test.com",
      password: "test!1234",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("authService.logout", () => {
  it("removes the token and the user from storage", () => {
    localStorage.setItem("token", "jwt-token");
    localStorage.setItem("user", JSON.stringify(authResponse));

    authService.logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("authService.getCurrentUser", () => {
  it("returns null when no user is stored", () => {
    expect(authService.getCurrentUser()).toBeNull();
  });

  it("returns the parsed user when one is stored", () => {
    localStorage.setItem("user", JSON.stringify(authResponse));

    expect(authService.getCurrentUser()).toEqual(authResponse);
  });
});

describe("authService.updateCurrentUser", () => {
  it("returns null and does not touch storage when no user is stored", () => {
    const result = authService.updateCurrentUser({ admin: true });

    expect(result).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("merges the update into the stored user and persists it", () => {
    localStorage.setItem("user", JSON.stringify(authResponse));

    const result = authService.updateCurrentUser({ admin: true });

    expect(result).toEqual({ ...authResponse, admin: true });
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual({
      ...authResponse,
      admin: true,
    });
  });
});

describe("authService.isAuthenticated", () => {
  it("returns false when no token is stored", () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  it("returns true when a token is stored", () => {
    localStorage.setItem("token", "jwt-token");

    expect(authService.isAuthenticated()).toBe(true);
  });
});
