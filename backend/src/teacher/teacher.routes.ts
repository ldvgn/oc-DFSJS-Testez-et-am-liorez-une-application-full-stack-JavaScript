import { Router } from "express";
import { TeacherController } from "./teacher.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const teacherController = new TeacherController();

export const teacherRouter = Router();
teacherRouter.use(authMiddleware);

teacherRouter.get("/", (req, res) => teacherController.getAll(req, res));
teacherRouter.get("/:id", (req, res) => teacherController.getById(req, res));
