import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";
import { authService } from "../services/auth.service";

vi.mock("../services/auth.service", () => ({
  authService: { login: vi.fn() },
}));

vi.mock("../utils/logger", () => ({ logger: { error: vi.fn() } }));

const mockedAuthService = vi.mocked(authService);

function renderLogin() {
  return render(
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Login />
    </BrowserRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Login", () => {
  it("renders the login form", () => {
    renderLogin();

    expect(screen.getByText("Login to Yoga Studio")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("logs in with the entered credentials", async () => {
    mockedAuthService.login.mockResolvedValueOnce({
      id: 1,
      email: "test@test.com",
      firstName: "Jane",
      lastName: "Doe",
      admin: false,
      token: "jwt-token",
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockedAuthService.login).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });
  });

  it("shows an error message when login fails", async () => {
    mockedAuthService.login.mockRejectedValueOnce(
      Object.assign(new Error("Request failed"), {
        isAxiosError: true,
        response: { data: { message: "Invalid credentials" } },
      }),
    );

    renderLogin();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows a loading state while the request is in flight", () => {
    mockedAuthService.login.mockReturnValue(new Promise(() => {}));

    renderLogin();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("has a link to the register page", () => {
    renderLogin();

    expect(
      screen.getByRole("link", { name: "Register here" }),
    ).toBeInTheDocument();
  });
});
