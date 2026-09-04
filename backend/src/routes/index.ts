import { Router } from "express";
import { authRouter } from "../auth/auth.routes";
import { sessionRouter } from "../session/session.routes";
import { teacherRouter } from "../teacher/teacher.routes";
import { userRouter } from "../user/user.routes";

const router = Router();

// Auth routes (public)
router.use("/auth", authRouter);

// Session, Teacher, User routes (protected)
router.use("/session", sessionRouter);
router.use("/teacher", teacherRouter);
router.use("/user", userRouter);

export default router;
