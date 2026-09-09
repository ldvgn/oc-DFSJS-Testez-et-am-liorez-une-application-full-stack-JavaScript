import { Response } from "express";
import { AuthRequest } from "../../commons/middleware/auth.middleware";
import { SessionService } from "./session.service";
import { parseId } from "../../commons/utils/parse-id.util";

export class SessionController {
  constructor(private readonly sessionService = new SessionService()) {}

  /**
   * `GET /sessions` — list every session.
   *
   * @param _ Authenticated request (unused).
   * @param res Express response.
   */
  async getAll(_: AuthRequest, res: Response): Promise<void> {
    const sessions = await this.sessionService.getAll();
    res.status(200).json(sessions);
  }

  /**
   * `GET /sessions/:id` — fetch a single session.
   *
   * @param req Authenticated request; `params.id` holds the session id.
   * @param res Express response.
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "Invalid session ID");
    const session = await this.sessionService.getById(id);
    res.status(200).json(session);
  }

  /**
   * `POST /sessions` — create a session (admin only).
   *
   * @param req Authenticated request.
   * @param res Express response.
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    const session = await this.sessionService.create(req.userId!, req.body);
    res.status(201).json(session);
  }

  /**
   * `PUT /sessions/:id` — update a session (admin only).
   *
   * @param req Authenticated request.
   * @param res Express response.
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "Invalid session ID");

    const session = await this.sessionService.update(req.userId!, id, req.body);
    res.status(200).json(session);
  }

  /**
   * `DELETE /sessions/:id` — delete a session (admin only).
   *
   * @param req Authenticated request.
   * @param res Express response.
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "Invalid session ID");

    await this.sessionService.delete(req.userId!, id);
    res.status(200).json({ message: "Session deleted successfully" });
  }

  /**
   * `POST /sessions/:id/participate/:userId` — register a user for a session.
   *
   * @param req Authenticated request.
   * @param res Express response.
   */
  async participate(req: AuthRequest, res: Response): Promise<void> {
    const sessionId = parseId(req.params.id, "Invalid session ID");
    const participantUserId = parseId(req.params.userId, "Invalid user ID");

    await this.sessionService.participate(participantUserId, sessionId);
    res.status(200).json({ message: "Successfully joined the session" });
  }

  /**
   * `DELETE /sessions/:id/participate/:userId` — remove a user from a session.
   *
   * @param req Authenticated request.
   * @param res Express response.
   */
  async unparticipate(req: AuthRequest, res: Response): Promise<void> {
    const sessionId = parseId(req.params.id, "Invalid session ID");
    const participantUserId = parseId(req.params.userId, "Invalid user ID");

    await this.sessionService.unparticipate(participantUserId, sessionId);
    res.status(200).json({ message: "Successfully left the session" });
  }
}
