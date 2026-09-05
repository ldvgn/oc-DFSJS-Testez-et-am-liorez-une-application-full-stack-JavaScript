import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _: NextFunction,
) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err);
  return res.status(500).json({ message: "Internal server error" });
};
