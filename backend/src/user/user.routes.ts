import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const userController = new UserController();

export const userRouter = Router();
userRouter.use(authMiddleware);

userRouter.get("/:id", (req, res) => userController.getById(req, res));
userRouter.post("/promote-admin", (req, res) =>
  userController.promoteSelfToAdmin(req, res),
);
userRouter.delete("/:id", (req, res) => userController.delete(req, res));
