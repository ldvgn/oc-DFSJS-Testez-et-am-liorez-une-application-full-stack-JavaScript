import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import z, { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ errors: z.treeifyError(err) });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  return res.status(500).json({ message: "Internal server error" });
};
