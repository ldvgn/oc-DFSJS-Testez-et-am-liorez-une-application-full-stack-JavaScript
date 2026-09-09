import { Response } from "express";
import { AuthRequest } from "../../commons/middleware/auth.middleware";
import { parseId } from "../../commons/utils/parse-id.util";
import { userService } from "./user.service";
import {
  ForbiddenError,
  UnauthorizedError,
} from "../../commons/errors/http-error";

export class UserController {
  /**
   * `GET /user/:id` — fetch a single user.
   *
   * @param req Authenticated request; `params.id` holds the user id.
   * @param res Express response.
   * @returns `200` with the user.
   * @throws BadRequestError When `params.id` is not a positive integer.
   * @throws NotFoundError When no user matches the id.
   */
  async getById(req: AuthRequest, res: Response) {
    const id = parseId(req.params.id, "Invalid user ID");

    return res.status(200).json(await userService.getById(id));
  }

  /**
   * `DELETE /user/:id` — delete the caller's own account.
   *
   * @param req Authenticated request; `params.id` must match `req.userId`.
   * @param res Express response.
   * @returns `200` with a confirmation message.
   * @throws BadRequestError When `params.id` is not a positive integer.
   * @throws ForbiddenError When `params.id` is not the authenticated user.
   * @throws NotFoundError When no user matches the id.
   */
  async delete(req: AuthRequest, res: Response) {
    const id = parseId(req.params.id, "Invalid user ID");

    if (req.userId !== id)
      throw new ForbiddenError("You can only delete your own account");

    await userService.delete(id);
    return res.status(200).json({ message: "User deleted successfully" });
  }

  /**
   * `POST /user/promote-admin` — grant admin rights to the caller. Development only.
   *
   * @param req Authenticated request; `req.userId` is the user to promote.
   * @param res Express response.
   * @returns `200` with the (possibly already admin) user profile.
   * @throws ForbiddenError When `NODE_ENV` is not `development`.
   * @throws UnauthorizedError When the request carries no authenticated user.
   * @throws NotFoundError When the authenticated user no longer exists.
   */
  async promoteSelfToAdmin(req: AuthRequest, res: Response) {
    const isDev = (process.env.NODE_ENV || "development") === "development";
    if (!isDev)
      throw new ForbiddenError(
        "Admin self-promotion is only available in development",
      );
    if (!req.userId) throw new UnauthorizedError();

    return res.status(200).json(await userService.promoteToAdmin(req.userId));
  }
}
