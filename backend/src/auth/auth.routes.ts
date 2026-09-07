import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateBody } from "../middleware/validate.middleware";
import { LoginSchema, RegisterSchema } from "./auth.dto";

const authController = new AuthController();

export const authRouter = Router();

authRouter.post("/login", validateBody(LoginSchema), (req, res) =>
  authController.login(req, res),
);
authRouter.post("/register", validateBody(RegisterSchema), (req, res) =>
  authController.register(req, res),
);
