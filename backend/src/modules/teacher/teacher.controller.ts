import { Response } from "express";
import { AuthRequest } from "../../commons/middleware/auth.middleware";
import { teacherService } from "./teacher.service";
import { parseId } from "../../commons/utils/parse-id.util";

export class TeacherController {
  /**
   * `GET /teacher` — list every teacher, newest first.
   *
   * @param _ Authenticated request (unused).
   * @param res Express response.
   * @returns `200` with the array of teachers.
   */
  async getAll(_: AuthRequest, res: Response) {
    return res.status(200).json(await teacherService.getAll());
  }

  /**
   * `GET /teacher/:id` — fetch a single teacher.
   *
   * @param req Authenticated request; `params.id` holds the teacher id.
   * @param res Express response.
   * @returns `200` with the teacher.
   * @throws BadRequestError When `params.id` is not a positive integer.
   * @throws NotFoundError When no teacher matches the id.
   */
  async getById(req: AuthRequest, res: Response) {
    const id = parseId(req.params.id, "Invalid teacher ID");

    return res.status(200).json(await teacherService.getById(id));
  }
}
