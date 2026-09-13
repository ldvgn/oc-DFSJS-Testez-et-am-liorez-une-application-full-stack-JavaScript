import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AxiosResponse } from "axios";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SessionForm from "./SessionForm";
import { authService } from "../services/auth.service";
import { sessionService } from "../services/session.service";
import { teacherService } from "../services/teacher.service";
import type { AuthResponse, Session, Teacher } from "../types";

vi.mock("../services/auth.service", () => ({
  authService: { getCurrentUser: vi.fn() },
}));

vi.mock("../services/session.service", () => ({
  sessionService: { getById: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

vi.mock("../services/teacher.service", () => ({
  teacherService: { getAll: vi.fn() },
}));

vi.mock("../utils/logger", () => ({
  logger: { error: vi.fn() },
}));

const mockedAuthService = vi.mocked(authService);
const mockedSessionService = vi.mocked(sessionService);
const mockedTeacherService = vi.mocked(teacherService);

function mockResponse<T>(data: T): AxiosResponse<T> {
  return { data } as AxiosResponse<T>;
}

function makeUser(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
    id: 1,
    email: "admin@test.com",
    firstName: "Jane",
    lastName: "Doe",
    admin: true,
    token: "jwt-token",
    ...overrides,
  };
}

function makeTeacher(overrides: Partial<Teacher> = {}): Teacher {
  return { id: 1, firstName: "John", lastName: "Doe", ...overrides };
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 7,
    name: "Morning Flow",
    date: "2026-01-05T09:00:00.000Z",
    description: "A gentle morning session",
    teacher: makeTeacher(),
    participants: [],
    ...overrides,
  };
}

/**
 * Renders SessionForm behind the real routes it's mounted on, so
 * useParams()/navigate() behave for real instead of being mocked.
 */
function renderSessionForm(path = "/sessions/create") {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/sessions/create" element={<SessionForm />} />
        <Route path="/sessions/edit/:id" element={<SessionForm />} />
        <Route path="/sessions" element={<div>Sessions List</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuthService.getCurrentUser.mockReturnValue(makeUser());
  mockedTeacherService.getAll.mockResolvedValue(mockResponse([]));
});

describe("SessionForm", () => {
  it("redirects a non-admin user away from the form", () => {
    mockedAuthService.getCurrentUser.mockReturnValue(
      makeUser({ admin: false }),
    );

    renderSessionForm();

    expect(screen.getByText("Sessions List")).toBeInTheDocument();
  });

  it("renders an empty form with the teacher list loaded, in create mode", async () => {
    const teachers = [
      makeTeacher({ id: 1, firstName: "John", lastName: "Doe" }),
      makeTeacher({ id: 3, firstName: "Alice", lastName: "Martin" }),
    ];
    mockedTeacherService.getAll.mockResolvedValue(mockResponse(teachers));

    renderSessionForm();

    expect(
      screen.getByRole("heading", { name: "Create New Session" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Session Name")).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "Create Session" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("option", { name: "Alice Martin" }),
    ).toBeInTheDocument();
  });

  it("prefills the form from the existing session in edit mode", async () => {
    const teacher = makeTeacher({
      id: 2,
      firstName: "Alice",
      lastName: "Martin",
    });
    mockedTeacherService.getAll.mockResolvedValue(mockResponse([teacher]));
    mockedSessionService.getById.mockResolvedValueOnce(
      mockResponse(makeSession({ teacher })),
    );

    renderSessionForm("/sessions/edit/7");

    expect(
      screen.getByRole("heading", { name: "Edit Session" }),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByLabelText("Session Name")).toHaveValue(
        "Morning Flow",
      ),
    );
    expect(screen.getByLabelText("Teacher")).toHaveValue("2");
    expect(screen.getByLabelText("Date")).toHaveValue("2026-01-05");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "A gentle morning session",
    );
    expect(
      screen.getByRole("button", { name: "Update Session" }),
    ).toBeInTheDocument();
  });

  it("submits the create form with the entered values and redirects to the sessions list", async () => {
    const teachers = [
      makeTeacher({ id: 1 }),
      makeTeacher({ id: 2, firstName: "Alice", lastName: "Martin" }),
    ];
    mockedTeacherService.getAll.mockResolvedValue(mockResponse(teachers));
    mockedSessionService.create.mockResolvedValueOnce(
      mockResponse(makeSession()),
    );

    const user = userEvent.setup();
    renderSessionForm();

    await user.type(screen.getByLabelText("Session Name"), "Evening Flow");
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2026-03-10" },
    });
    await user.selectOptions(await screen.findByLabelText("Teacher"), "2");
    await user.type(
      screen.getByLabelText("Description"),
      "A relaxing evening session",
    );

    await user.click(screen.getByRole("button", { name: "Create Session" }));

    await waitFor(() => {
      expect(mockedSessionService.create).toHaveBeenCalledWith({
        name: "Evening Flow",
        date: "2026-03-10",
        description: "A relaxing evening session",
        teacherId: 2,
      });
    });
    expect(await screen.findByText("Sessions List")).toBeInTheDocument();
  });

  it("submits the edit form with the updated values against the right session id", async () => {
    const teacher = makeTeacher({
      id: 2,
      firstName: "Alice",
      lastName: "Martin",
    });
    mockedTeacherService.getAll.mockResolvedValue(mockResponse([teacher]));
    mockedSessionService.getById.mockResolvedValueOnce(
      mockResponse(makeSession({ teacher })),
    );
    mockedSessionService.update.mockResolvedValueOnce(
      mockResponse(makeSession()),
    );

    const user = userEvent.setup();
    renderSessionForm("/sessions/edit/7");

    await waitFor(() =>
      expect(screen.getByLabelText("Session Name")).toHaveValue(
        "Morning Flow",
      ),
    );

    await user.clear(screen.getByLabelText("Session Name"));
    await user.type(screen.getByLabelText("Session Name"), "Updated Flow");

    await user.click(screen.getByRole("button", { name: "Update Session" }));

    await waitFor(() => {
      expect(mockedSessionService.update).toHaveBeenCalledWith(7, {
        name: "Updated Flow",
        date: "2026-01-05",
        description: "A gentle morning session",
        teacherId: 2,
      });
    });
    expect(await screen.findByText("Sessions List")).toBeInTheDocument();
  });

  it("shows the fallback error message when saving fails", async () => {
    const teachers = [makeTeacher({ id: 1 })];
    mockedTeacherService.getAll.mockResolvedValue(mockResponse(teachers));
    mockedSessionService.create.mockRejectedValueOnce(new Error("boom"));

    const user = userEvent.setup();
    renderSessionForm();

    await user.type(screen.getByLabelText("Session Name"), "Evening Flow");
    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2026-03-10" },
    });
    await user.selectOptions(await screen.findByLabelText("Teacher"), "1");
    await user.type(
      screen.getByLabelText("Description"),
      "A relaxing evening session",
    );

    await user.click(screen.getByRole("button", { name: "Create Session" }));

    expect(
      await screen.findByText("Failed to save session"),
    ).toBeInTheDocument();
  });

  it("shows the session error when the session fails to load in edit mode", async () => {
    mockedSessionService.getById.mockRejectedValueOnce(
      new Error("network down"),
    );

    renderSessionForm("/sessions/edit/9");

    expect(
      await screen.findByText("Failed to load session details"),
    ).toBeInTheDocument();
  });

  it("navigates to the sessions list when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderSessionForm();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Sessions List")).toBeInTheDocument();
  });
});
