import { Router } from "express";
import { SessionController } from "./session.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const sessionController = new SessionController();

export const sessionRouter = Router();

sessionRouter.get("/", authMiddleware, (req, res) =>
  sessionController.getAll(req, res),
);
sessionRouter.get("/:id", authMiddleware, (req, res) =>
  sessionController.getById(req, res),
);
sessionRouter.post("/", authMiddleware, (req, res) =>
  sessionController.create(req, res),
);
sessionRouter.put("/:id", authMiddleware, (req, res) =>
  sessionController.update(req, res),
);
sessionRouter.delete("/:id", authMiddleware, (req, res) =>
  sessionController.delete(req, res),
);
sessionRouter.post("/:id/participate/:userId", authMiddleware, (req, res) =>
  sessionController.participate(req, res),
);
sessionRouter.delete("/:id/participate/:userId", authMiddleware, (req, res) =>
  sessionController.unparticipate(req, res),
);
