import { Response } from "express";
import { AuthRequest } from "../../commons/middleware/auth.middleware";
import { sessionService } from "./session.service";
import { parseId } from "../../commons/utils/parse-id.util";

export class SessionController {
  /**
   * `GET /sessions` — list every session.
   *
   * @param _ Authenticated request (unused).
   * @param res Express response.
   * @returns `200` with the array of sessions.
   */
  async getAll(_: AuthRequest, res: Response) {
    return res.status(200).json(await sessionService.getAll());
  }

  /**
   * `GET /sessions/:id` — fetch a single session.
   *
   * @param req Authenticated request; `params.id` holds the session id.
   * @param res Express response.
   * @returns `200` with the session.
   * @throws BadRequestError When `params.id` is not a positive integer.
   * @throws NotFoundError When no session matches the id.
   */
  async getById(req: AuthRequest, res: Response) {
    const id = parseId(req.params.id, "Invalid session ID");

    return res.status(200).json(await sessionService.getById(id));
  }

  /**
   * `POST /sessions` — create a session. Admin only.
   *
   * @param req Authenticated request; `body` is a {@link CreateSessionDto}, `userId` the caller.
   * @param res Express response.
   * @returns `201` with the created session.
   * @throws ForbiddenError When the caller is not an admin.
   * @throws NotFoundError When the referenced teacher does not exist.
   */
  async create(req: AuthRequest, res: Response) {
    const session = await sessionService.create(req.userId!, req.body);

    return res.status(201).json(session);
  }

  /**
   * `PUT /sessions/:id` — update a session. Admin only.
   *
   * @param req Authenticated request; `params.id` the session, `body` an {@link UpdateSessionDto}.
   * @param res Express response.
   * @returns `200` with the updated session.
   * @throws BadRequestError When `params.id` is not a positive integer.
   * @throws ForbiddenError When the caller is not an admin.
   * @throws NotFoundError When the session or the referenced teacher does not exist.
   */
  async update(req: AuthRequest, res: Response) {
    const id = parseId(req.params.id, "Invalid session ID");

    return res
      .status(200)
      .json(await sessionService.update(req.userId!, id, req.body));
  }

  /**
   * `DELETE /sessions/:id` — delete a session. Admin only.
   *
   * @param req Authenticated request; `params.id` holds the session id.
   * @param res Express response.
   * @returns `200` with a confirmation message.
   * @throws BadRequestError When `params.id` is not a positive integer.
   * @throws ForbiddenError When the caller is not an admin.
   * @throws NotFoundError When no session matches the id.
   */
  async delete(req: AuthRequest, res: Response) {
    const id = parseId(req.params.id, "Invalid session ID");

    await sessionService.delete(req.userId!, id);

    return res.status(200).json({ message: "Session deleted successfully" });
  }

  /**
   * `POST /sessions/:id/participate/:userId` — register a user for a session.
   *
   * @param req Authenticated request; `params.id` the session, `params.userId` the user.
   * @param res Express response.
   * @returns `200` with a confirmation message.
   * @throws BadRequestError When an id param is invalid or the user already participates.
   * @throws NotFoundError When the session or user does not exist.
   */
  async participate(req: AuthRequest, res: Response) {
    const sessionId = parseId(req.params.id, "Invalid session ID");
    const participantUserId = parseId(req.params.userId, "Invalid user ID");

    await sessionService.participate(participantUserId, sessionId);

    return res.status(200).json({ message: "Successfully joined the session" });
  }

  /**
   * `DELETE /sessions/:id/participate/:userId` — remove a user from a session.
   *
   * @param req Authenticated request; `params.id` the session, `params.userId` the user.
   * @param res Express response.
   * @returns `200` with a confirmation message.
   * @throws BadRequestError When an id param is invalid.
   * @throws NotFoundError When the participation does not exist.
   */
  async unparticipate(req: AuthRequest, res: Response) {
    const sessionId = parseId(req.params.id, "Invalid session ID");
    const participantUserId = parseId(req.params.userId, "Invalid user ID");

    await sessionService.unparticipate(participantUserId, sessionId);

    return res.status(200).json({ message: "Successfully left the session" });
  }
}
