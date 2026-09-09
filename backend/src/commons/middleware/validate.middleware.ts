import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validateBody =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    // Lève une ZodError si invalide
    req.body = schema.parse(req.body);
    next();
  };
