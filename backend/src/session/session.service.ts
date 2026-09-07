import { Prisma } from "@prisma/client";
import { sessionRepository } from "./session.repository";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/http-error";
import { userRepository } from "../user/user.repository";
import { teacherRepository } from "../teacher/teacher.repository";
import { CreateSessionDto, UpdateSessionDto } from "./session.dto";

type SessionWithRelations = Prisma.SessionGetPayload<{
  include: {
    teacher: true;
    participants: { include: { user: true } };
  };
}>;

/**
 * Map a session and its relations to the API response shape.
 *
 * @param session The session with `teacher` and `participants.user` loaded.
 * @returns A plain object exposing the teacher summary and participant user ids.
 */
const formatSessionResponse = (session: SessionWithRelations) => ({
  id: session.id,
  name: session.name,
  date: session.date,
  description: session.description,
  teacher: {
    id: session.teacher.id,
    firstName: session.teacher.firstName,
    lastName: session.teacher.lastName,
  },
  users: session.participants.map((p) => p.user.id),
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
});

/**
 * Load a user and assert admin privileges.
 *
 * @param id The user id.
 * @returns The admin user.
 * @throws ForbiddenError When the user is missing or not an admin.
 */
const getAdminUserOrThrow = async (id: number) => {
  const user = await userRepository.findOne(id);
  if (!user || !user.admin) throw new ForbiddenError("Admin access required");

  return user;
};

/**
 * Load a session by id, relations included.
 *
 * @param id The session id.
 * @returns The session with its `teacher` and `participants`.
 * @throws NotFoundError When the session does not exist.
 */
const getSessionOrThrow = async (id: number) => {
  const session = await sessionRepository.findOne(id);
  if (!session) throw new NotFoundError("Session not found");

  return session;
};

/**
 * Load a teacher by id.
 *
 * @param id The teacher id.
 * @returns The teacher.
 * @throws NotFoundError When the teacher does not exist.
 */
const getTeacherOrThrow = async (id: number) => {
  const teacher = await teacherRepository.findOne(id);
  if (!teacher) throw new NotFoundError("Teacher not found");

  return teacher;
};

export const sessionService = {
  /**
   * List every session, formatted for the API.
   *
   * @returns The array of formatted sessions.
   */
  async getAll() {
    const sessions = await sessionRepository.findAll();
    return sessions.map(formatSessionResponse);
  },

  /**
   * Fetch a single session by id, formatted for the API.
   *
   * @param id The session id.
   * @returns The formatted session.
   * @throws NotFoundError When no session matches the id.
   */
  async getById(id: number) {
    return formatSessionResponse(await getSessionOrThrow(id));
  },

  /**
   * Create a session. Restricted to admin users.
   *
   * @param userId The id of the calling user, expected to be an admin.
   * @param dto The session payload.
   * @returns The created session, formatted for the API.
   * @throws ForbiddenError When the user is not an admin.
   * @throws NotFoundError When the referenced teacher does not exist.
   */
  async create(userId: number, dto: CreateSessionDto) {
    await getAdminUserOrThrow(userId);
    await getTeacherOrThrow(dto.teacherId);

    const session = await sessionRepository.create({
      name: dto.name,
      date: new Date(dto.date),
      description: dto.description,
      teacherId: dto.teacherId,
    });

    return formatSessionResponse(session);
  },

  /**
   * Update a session. Restricted to admin users.
   *
   * @param userId The id of the calling user, expected to be an admin.
   * @param sessionId The id of the session to update.
   * @param dto The fields to change; `teacherId` is validated when provided.
   * @returns The updated session, formatted for the API.
   * @throws ForbiddenError When the user is not an admin.
   * @throws NotFoundError When the session or the referenced teacher does not exist.
   */
  async update(userId: number, sessionId: number, dto: UpdateSessionDto) {
    await getAdminUserOrThrow(userId);
    await getSessionOrThrow(sessionId);

    if (dto.teacherId) {
      await getTeacherOrThrow(dto.teacherId);
    }

    const updatedSession = await sessionRepository.update(sessionId, {
      name: dto.name,
      description: dto.description,
      teacherId: dto.teacherId,
      date: dto.date ? new Date(dto.date) : undefined,
    });

    return formatSessionResponse(updatedSession);
  },

  /**
   * Delete a session. Restricted to admin users.
   *
   * @param userId The id of the calling user, expected to be an admin.
   * @param sessionId The id of the session to delete.
   * @throws ForbiddenError When the user is not an admin.
   * @throws NotFoundError When the session does not exist.
   */
  async delete(userId: number, sessionId: number) {
    await getAdminUserOrThrow(userId);
    await getSessionOrThrow(sessionId);

    await sessionRepository.delete(sessionId);
  },

  /**
   * Register a user as a participant of a session.
   *
   * @param userId The id of the user to register.
   * @param sessionId The id of the session.
   * @throws NotFoundError When the session or the user does not exist.
   * @throws BadRequestError When the user already participates in the session.
   */
  async participate(userId: number, sessionId: number) {
    await getSessionOrThrow(sessionId);

    const user = await userRepository.findOne(userId);
    if (!user) throw new NotFoundError("User not found");

    const existingParticipation = await sessionRepository.findParticipation(
      sessionId,
      userId,
    );
    if (existingParticipation)
      throw new BadRequestError("User already participating in this session");

    await sessionRepository.addParticipation(sessionId, userId);
  },

  /**
   * Remove a user from the participants of a session.
   *
   * @param userId The id of the user to remove.
   * @param sessionId The id of the session.
   * @throws NotFoundError When the session or the participation does not exist.
   */
  async unparticipate(userId: number, sessionId: number) {
    await getSessionOrThrow(sessionId);

    const participation = await sessionRepository.findParticipation(
      sessionId,
      userId,
    );

    if (!participation) throw new NotFoundError("Participation not found");

    await sessionRepository.deleteParticipation(sessionId, userId);
  },
};
