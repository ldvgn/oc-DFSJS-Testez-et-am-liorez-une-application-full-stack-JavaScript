import { Router } from "express";
import { TeacherController } from "./teacher.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const teacherController = new TeacherController();

export const teacherRouter = Router();

teacherRouter.get("/", authMiddleware, (req, res) =>
  teacherController.getAll(req, res),
);
teacherRouter.get("/:id", authMiddleware, (req, res) =>
  teacherController.getById(req, res),
);
