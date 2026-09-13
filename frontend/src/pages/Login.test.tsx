import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

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

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "wrong@test.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows a loading state while the request is in flight", async () => {
    mockedAuthService.login.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "test@test.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("has a link to the register page", () => {
    renderLogin();

    expect(
      screen.getByRole("link", { name: "Register here" }),
    ).toBeInTheDocument();
  });
});
