import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  return res.status(500).json({ message: "Internal server error" });
};
