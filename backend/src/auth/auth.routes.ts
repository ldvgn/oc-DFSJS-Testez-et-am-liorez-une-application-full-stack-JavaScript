import { Router } from "express";
import { AuthController } from "./auth.controller";

const authController = new AuthController();

export const authRouter = Router();

authRouter.post("/login", (req, res) => authController.login(req, res));
authRouter.post("/register", (req, res) => authController.register(req, res));
