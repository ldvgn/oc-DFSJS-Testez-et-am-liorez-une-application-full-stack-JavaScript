import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly service = new AuthService()) {}

  /**
   * `POST /auth/login` — authenticate a user and issue a JWT.
   *
   * @param req Request; `body` is a {@link LoginDto}.
   * @param res Express response.
   */
  async login(req: Request, res: Response): Promise<void> {
    const payload = await this.service.login(req.body);
    res.status(200).json(payload);
  }

  /**
   * `POST /auth/register` — create a user account and issue a JWT.
   *
   * @param req Request; `body` is a {@link RegisterDto}.
   * @param res Express response.
   */
  async register(req: Request, res: Response): Promise<void> {
    const payload = await this.service.register(req.body);
    res.status(201).json(payload);
  }
}
