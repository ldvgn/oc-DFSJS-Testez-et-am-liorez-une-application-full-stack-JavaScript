import { Request, Response } from "express";
import { authService } from "./auth.service";

export class AuthController {
  /**
   * `POST /auth/login` — authenticate a user and issue a JWT.
   *
   * @param req Request; `body` is a {@link LoginDto}.
   * @param res Express response.
   * @returns `200` with the user profile and a `token`.
   * @throws UnauthorizedError When the credentials are invalid.
   */
  async login(req: Request, res: Response) {
    return res.status(200).json(await authService.login(req.body));
  }

  /**
   * `POST /auth/register` — create a user account and issue a JWT.
   *
   * @param req Request; `body` is a {@link RegisterDto}.
   * @param res Express response.
   * @returns `201` with the created user profile and a `token`.
   * @throws BadRequestError When the email is already taken.
   */
  async register(req: Request, res: Response) {
    return res.status(201).json(await authService.register(req.body));
  }
}
