import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "./Register";
import { authService } from "../services/auth.service";

vi.mock("../services/auth.service", () => ({
  authService: { register: vi.fn() },
}));

vi.mock("../utils/logger", () => ({ logger: { error: vi.fn() } }));

const mockedAuthService = vi.mocked(authService);

function renderRegister() {
  return render(
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Register />
    </BrowserRouter>,
  );
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId("firstname"), "Jane");
  await user.type(screen.getByTestId("lastname"), "Doe");
  await user.type(screen.getByTestId("email"), "jane@test.com");
  await user.type(screen.getByTestId("password"), "password123");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Register", () => {
  it("renders the registration form", () => {
    renderRegister();

    expect(screen.getByText("Register for Yoga Studio")).toBeInTheDocument();
    expect(screen.getByTestId("firstname")).toBeInTheDocument();
    expect(screen.getByTestId("lastname")).toBeInTheDocument();
    expect(screen.getByTestId("email")).toBeInTheDocument();
    expect(screen.getByTestId("password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" }),
    ).toBeInTheDocument();
  });

  it("registers with the entered values", async () => {
    mockedAuthService.register.mockResolvedValueOnce({
      id: 1,
      email: "jane@test.com",
      firstName: "Jane",
      lastName: "Doe",
      admin: false,
      token: "jwt-token",
    });

    const user = userEvent.setup();
    renderRegister();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockedAuthService.register).toHaveBeenCalledWith({
        email: "jane@test.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Doe",
      });
    });
  });

  it("shows an error message when registration fails", async () => {
    mockedAuthService.register.mockRejectedValueOnce(
      Object.assign(new Error("Request failed"), {
        isAxiosError: true,
        response: { data: { message: "Email already exists" } },
      }),
    );

    const user = userEvent.setup();
    renderRegister();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });

  it("shows a loading state while the request is in flight", async () => {
    mockedAuthService.register.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    renderRegister();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Registering...")).toBeInTheDocument();
  });

  it("has a link to the login page", () => {
    renderRegister();

    expect(
      screen.getByRole("link", { name: "Login here" }),
    ).toBeInTheDocument();
  });
});
