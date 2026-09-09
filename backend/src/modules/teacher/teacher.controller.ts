import { Response } from "express";
import { AuthRequest } from "../../commons/middleware/auth.middleware";
import { TeacherService } from "./teacher.service";
import { parseId } from "../../commons/utils/parse-id.util";

/** HTTP layer for the `teacher` domain: reads the request, delegates, sends the response. */
export class TeacherController {
  constructor(private readonly service = new TeacherService()) {}

  /**
   * `GET /teacher` — list every teacher, newest first.
   *
   * @param _ Authenticated request (unused).
   * @param res Express response.
   */
  async getAll(_: AuthRequest, res: Response): Promise<void> {
    const teachers = await this.service.getAll();
    res.status(200).json(teachers);
  }

  /**
   * `GET /teacher/:id` — fetch a single teacher.
   *
   * @param req Authenticated request; `params.id` holds the teacher id.
   * @param res Express response.
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "Invalid teacher ID");
    const teacher = await this.service.getById(id);
    res.status(200).json(teacher);
  }
}
