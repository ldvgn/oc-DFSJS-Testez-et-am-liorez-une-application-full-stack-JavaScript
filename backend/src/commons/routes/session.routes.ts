import { Router } from "express";
import { SessionController } from "../../modules/session/session.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  CreateSessionSchema,
  UpdateSessionSchema,
} from "../../modules/session/session.dto";

const sessionController = new SessionController();

export const sessionRouter = Router();
sessionRouter.use(authMiddleware);

sessionRouter.get("/", (req, res) => sessionController.getAll(req, res));
sessionRouter.get("/:id", (req, res) => sessionController.getById(req, res));
sessionRouter.post("/", validateBody(CreateSessionSchema), (req, res) =>
  sessionController.create(req, res),
);
sessionRouter.put("/:id", validateBody(UpdateSessionSchema), (req, res) =>
  sessionController.update(req, res),
);
sessionRouter.delete("/:id", (req, res) => sessionController.delete(req, res));
sessionRouter.post("/:id/participate/:userId", (req, res) =>
  sessionController.participate(req, res),
);
sessionRouter.delete("/:id/participate/:userId", (req, res) =>
  sessionController.unparticipate(req, res),
);
