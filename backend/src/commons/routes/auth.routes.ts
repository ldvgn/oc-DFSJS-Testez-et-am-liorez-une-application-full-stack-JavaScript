import { Router } from "express";
import { AuthController } from "../../modules/auth/auth.controller";
import { validateBody } from "../middleware/validate.middleware";
import { LoginSchema, RegisterSchema } from "../../modules/auth/auth.dto";

const authController = new AuthController();

export const authRouter = Router();

authRouter.post("/login", validateBody(LoginSchema), (req, res) =>
  authController.login(req, res),
);
authRouter.post("/register", validateBody(RegisterSchema), (req, res) =>
  authController.register(req, res),
);
