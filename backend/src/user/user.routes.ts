import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const userController = new UserController();

export const userRouter = Router();

userRouter.get("/:id", authMiddleware, (req, res) =>
  userController.getById(req, res),
);
userRouter.post("/promote-admin", authMiddleware, (req, res) =>
  userController.promoteSelfToAdmin(req, res),
);
userRouter.delete("/:id", authMiddleware, (req, res) =>
  userController.delete(req, res),
);
