import type { RequestHandler } from "express";
import type { ZodType } from "zod";

/**
 * Validate `req.body` against `schema` and replace it with the parsed value.
 *
 * @param schema - Zod schema for the request body.
 * @returns An Express middleware; a failed parse throws `ZodError` (→ 400).
 */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}
