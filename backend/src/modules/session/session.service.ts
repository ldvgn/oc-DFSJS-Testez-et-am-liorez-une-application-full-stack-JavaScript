import {
  SessionRepository,
  type SessionWithRelations,
} from "./session.repository";
import {
  BadRequestError,
  NotFoundError,
} from "../../commons/errors/http-error";
import {
  CreateSessionDto,
  SessionResponse,
  SessionResponseSchema,
  UpdateSessionDto,
} from "./session.dto";
import { UserService } from "../user/user.service";
import { TeacherService } from "../teacher/teacher.service";

/**
 * Business logic for the `session` domain.
 *
 * Owns the session repository and is the only layer that turns a missing row into a {@link NotFoundError}.
 */
export class SessionService {
  constructor(
    private readonly sessionRepo = new SessionRepository(),
    private readonly userService = new UserService(),
    private readonly teacherService = new TeacherService(),
  ) {}

  /**
   * List every session.
   *
   * @returns The array of formatted sessions.
   */
  async getAll(): Promise<SessionResponse[]> {
    const sessions = await this.sessionRepo.findAll();

    return sessions.map((session) => this.toResponse(session));
  }

  /**
   * Fetch a single session by id.
   *
   * @param id The session id.
   * @returns The formatted session.
   *
   * @throws {NotFoundError} When no session matches the id.
   */
  async getById(id: number): Promise<SessionResponse> {
    const session = await this.getSessionOrThrow(id);

    return this.toResponse(session);
  }

  /**
   * Create a session. Restricted to admin users.
   *
   * @param userId The id of the calling user, expected to be an admin.
   * @param dto The session payload.
   * @returns The created session, formatted for the API.
   *
   * @throws {ForbiddenError} When the user is not an admin.
   * @throws {NotFoundError} When the referenced teacher does not exist.
   */
  async create(
    userId: number,
    dto: CreateSessionDto,
  ): Promise<SessionResponse> {
    await this.userService.getAdminOrThrow(userId);
    await this.teacherService.getTeacherOrThrow(dto.teacherId);

    const session = await this.sessionRepo.create({
      name: dto.name,
      date: new Date(dto.date),
      description: dto.description,
      teacherId: dto.teacherId,
    });

    return this.toResponse(session);
  }

  /**
   * Update a session. Restricted to admin users.
   *
   * @param userId The id of the calling user, expected to be an admin.
   * @param sessionId The id of the session to update.
   * @param dto The fields to change; `teacherId` is validated when provided.
   * @returns The updated session, formatted for the API.
   *
   * @throws {ForbiddenError} When the user is not an admin.
   * @throws {NotFoundError} When the session or the referenced teacher does not exist.
   */
  async update(
    userId: number,
    sessionId: number,
    dto: UpdateSessionDto,
  ): Promise<SessionResponse> {
    await this.userService.getAdminOrThrow(userId);
    await this.getSessionOrThrow(sessionId);

    if (dto.teacherId) {
      await this.teacherService.getTeacherOrThrow(dto.teacherId);
    }

    const updatedSession = await this.sessionRepo.update(sessionId, {
      name: dto.name,
      description: dto.description,
      teacherId: dto.teacherId,
      date: dto.date ? new Date(dto.date) : undefined,
    });

    return this.toResponse(updatedSession);
  }

  /**
   * Delete a session. Restricted to admin users.
   *
   * @param userId The id of the calling user, expected to be an admin.
   * @param sessionId The id of the session to delete.
   *
   * @throws {ForbiddenError} When the user is not an admin.
   * @throws {NotFoundError} When the session does not exist.
   */
  async delete(userId: number, sessionId: number): Promise<void> {
    await this.userService.getAdminOrThrow(userId);
    await this.getSessionOrThrow(sessionId);

    await this.sessionRepo.delete(sessionId);
  }

  /**
   * Register a user as a participant of a session.
   *
   * @param userId The id of the user to register.
   * @param sessionId The id of the session.
   *
   * @throws {NotFoundError} When the session or the user does not exist.
   * @throws {BadRequestError} When the user already participates in the session.
   */
  async participate(userId: number, sessionId: number): Promise<void> {
    await this.getSessionOrThrow(sessionId);
    await this.userService.getUserOrThrow(userId);

    const existingParticipation = await this.sessionRepo.findParticipation(
      sessionId,
      userId,
    );

    if (existingParticipation)
      throw new BadRequestError("User already participating in this session");

    await this.sessionRepo.addParticipation(sessionId, userId);
  }

  /**
   * Remove a user from the participants of a session.
   *
   * @param userId The id of the user to remove.
   * @param sessionId The id of the session.
   *
   * @throws {NotFoundError} When the session or the participation does not exist.
   */
  async unparticipate(userId: number, sessionId: number): Promise<void> {
    await this.getSessionOrThrow(sessionId);

    const participation = await this.sessionRepo.findParticipation(
      sessionId,
      userId,
    );

    if (!participation) throw new NotFoundError("Participation not found");

    await this.sessionRepo.deleteParticipation(sessionId, userId);
  }

  /**
   * Load a session by id or fail.
   *
   * @param id The session id.
   * @returns The matching session.
   *
   * @throws {NotFoundError} When no session matches the id.
   */
  private async getSessionOrThrow(id: number): Promise<SessionWithRelations> {
    const session = await this.sessionRepo.findOne(id);
    if (!session) throw new NotFoundError("Session not found");

    return session;
  }

  /**
   * Map a session entity to the API response shape.
   *
   * @param session The session entity.
   * @returns A plain object with the public session fields.
   */
  private toResponse(session: SessionWithRelations): SessionResponse {
    return SessionResponseSchema.parse(session);
  }
}
