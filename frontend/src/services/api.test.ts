import type {
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";

const originalAdapter = api.defaults.adapter;

/**
 * Replaces the axios adapter with a stub that never hits the network and
 * captures the outgoing request config (post-interceptors) instead.
 */
function captureRequestConfig() {
  let capturedConfig: InternalAxiosRequestConfig | undefined;

  api.defaults.adapter = vi.fn(
    async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
      capturedConfig = config;
      return { data: null, status: 200, statusText: "OK", headers: {}, config };
    },
  );

  return () => capturedConfig!;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  api.defaults.adapter = originalAdapter;
});

describe("api request interceptor", () => {
  it("attaches the Authorization header when a token is stored", async () => {
    localStorage.setItem("token", "jwt-token");
    const getConfig = captureRequestConfig();

    await api.get("/health");

    const headers = getConfig().headers as AxiosHeaders;
    expect(headers.get("Authorization")).toBe("Bearer jwt-token");
  });

  it("does not attach an Authorization header when no token is stored", async () => {
    const getConfig = captureRequestConfig();

    await api.get("/health");

    const headers = getConfig().headers as AxiosHeaders;
    expect(headers.has("Authorization")).toBe(false);
  });
});
