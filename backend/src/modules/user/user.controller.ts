import { Response } from "express";
import { AuthRequest } from "../../commons/middleware/auth.middleware";
import { parseId } from "../../commons/utils/parse-id.util";
import { ForbiddenError } from "../../commons/errors/http-error";
import { UserService } from "./user.service";

/** HTTP layer for the `user` domain: reads the request, delegates, sends the response. */
export class UserController {
  constructor(private readonly userService = new UserService()) {}

  /**
   * `GET /user/:id` — fetch a single user.
   *
   * @param req Authenticated request.
   * @param res Express response.
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "Invalid user ID");

    res.status(200).json(await this.userService.getById(id));
  }

  /**
   * `DELETE /user/:id` — delete the caller's own account.
   *
   * @param req Authenticated request.
   * @param res Express response.
   */
  async remove(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id, "Invalid user ID");
    if (req.userId !== id)
      throw new ForbiddenError("You can only delete your own account");

    await this.userService.remove(id);
    res.status(200).json({ message: "User deleted successfully" });
  }

  /**
   * `POST /user/promote-admin` — grant admin rights to the caller. Dev only.
   *
   * @param req Authenticated request.
   * @param res Express response.
   */
  async promoteSelfToAdmin(req: AuthRequest, res: Response): Promise<void> {
    const promotedUser = await this.userService.promoteSelfToAdmin(req.userId!);

    res.status(200).json(promotedUser);
  }
}
