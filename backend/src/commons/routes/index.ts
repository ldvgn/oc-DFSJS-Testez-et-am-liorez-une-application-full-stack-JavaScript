import { Router } from "express";
import { authRouter } from "./auth.routes";
import { sessionRouter } from "./session.routes";
import { teacherRouter } from "./teacher.routes";
import { userRouter } from "./user.routes";

const router = Router();

// Auth routes (public)
router.use("/auth", authRouter);

// Session, Teacher, User routes (protected)
router.use("/session", sessionRouter);
router.use("/teacher", teacherRouter);
router.use("/user", userRouter);

export default router;
